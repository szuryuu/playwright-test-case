package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const (
	Reset  = "\033[0m"
	Red    = "\033[31m"
	Green  = "\033[32m"
	Yellow = "\033[33m"
	Cyan   = "\033[36m"
	Bold   = "\033[1m"
)

type PackageJSON struct {
	Dependencies    map[string]string `json:"dependencies"`
	DevDependencies map[string]string `json:"devDependencies"`
}

var forbiddenFrameworks = []string{"react", "vue", "@angular/core", "nuxt", "next"}

func main() {
	args := os.Args[1:]

	// Deprecated 1-arg alias: reviewer <sub1|sub2|sub3> [zip].
	// sub1/sub2 → fe/fundamental/*; sub3 was beginner's first submission.
	if len(args) >= 1 && isLegacySub(args[0]) {
		group, class, sub := "fe", "fundamental", args[0]
		if args[0] == "sub3" {
			class, sub = "beginner", "sub1"
		}
		fmt.Printf("%s[i] [INFO] Deprecated 1-arg invocation. Mapping %s → %s/%s/%s. Use: reviewer <group> <class> <sub> [path-to-zip] [username]%s\n", Yellow, args[0], group, class, sub, Reset)
		zipPath := ""
		if len(args) >= 2 {
			zipPath = args[1]
		}
		runReview(group, class, sub, zipPath, "")
		return
	}

	if len(args) < 3 {
		printUsage()
		os.Exit(1)
	}

	group, class, sub := args[0], args[1], args[2]

	var zipPath, username string
	if len(args) >= 4 {
		if strings.HasSuffix(strings.ToLower(args[3]), ".zip") {
			zipPath = args[3]
			if len(args) >= 5 {
				username = args[4]
			}
			if len(args) > 5 {
				fmt.Printf("%s[-] [ERROR] Too many arguments.%s\n", Red, Reset)
				printUsage()
				os.Exit(1)
			}
		} else {
			// A non-.zip 4th positional is the username; auto-detect the zip.
			username = args[3]
			if len(args) >= 5 {
				fmt.Printf("%s[-] [ERROR] Too many arguments: unexpected %q after username.%s\n", Red, args[4], Reset)
				printUsage()
				os.Exit(1)
			}
		}
	}

	runReview(group, class, sub, zipPath, username)
}

func printUsage() {
	fmt.Printf("%s[-] [ERROR] Usage: reviewer <group> <class> <sub> [path-to-zip] [username]%s\n", Red, Reset)
}

func isLegacySub(s string) bool {
	return s == "sub1" || s == "sub2" || s == "sub3"
}

func runReview(group, class, sub, zipPath, username string) {
	registryKey := group + "/" + class + "/" + sub

	if zipPath == "" {
		fmt.Printf("%s[i] [INFO] No ZIP path provided. Searching for the newest submission...%s\n", Cyan, Reset)
		zipPath = getLatestZip()
	}

	fmt.Printf("\n%s%s[>] [LAYER 1] Starting Static Analysis for %s: %s%s\n", Bold, Cyan, strings.ToUpper(registryKey), zipPath, Reset)

	tmpDir, err := os.MkdirTemp("", "dicoding-review-*")
	if err != nil {
		fmt.Printf("%s[-] [FATAL] Failed to create temp directory: %v%s\n", Red, err, Reset)
		os.Exit(1)
	}
	defer os.RemoveAll(tmpDir)

	requireHTML := group == "fe"
	err = extractAndValidateZip(zipPath, tmpDir, requireHTML)
	if err != nil {
		fmt.Printf("%s[-] [REJECTED] Static validation failed: %v%s\n", Red, err, Reset)
		os.Exit(1)
	}

	fmt.Printf("%s[+] [PASS] Static validation successful. No prohibited frameworks or 'node_modules' detected.%s\n", Green, Reset)

	var actualProjectDir string
	if group == "be" {
		actualProjectDir, err = validateBeStructure(tmpDir)
		if err != nil {
			fmt.Printf("%s[-] [REJECTED] Structure validation failed: %v%s\n", Red, err, Reset)
			os.Exit(1)
		}
	} else {
		actualProjectDir = resolveTargetDirectory(tmpDir)
		if actualProjectDir != tmpDir {
			fmt.Printf("%s[i] [INFO] Nested directory structure detected. Dynamically adjusting root to: %s%s\n", Yellow, filepath.Base(actualProjectDir), Reset)
		}
	}

	if group == "be" {
		fmt.Printf("%s%s[*] [LAYER 2] Handing over to Node Runner...%s\n", Bold, Cyan, Reset)
	} else {
		fmt.Printf("%s%s[*] [LAYER 2] Handing over to Playwright E2E Runner...%s\n", Bold, Cyan, Reset)
	}
	runRunner(registryKey, actualProjectDir, username)
}

func getLatestZip() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Printf("%s[-] [FATAL] Could not determine home directory: %v%s\n", Red, err, Reset)
		os.Exit(1)
	}

	targetDir := filepath.Join(homeDir, "Personal", "temp", "dicoding-submission")
	files, err := os.ReadDir(targetDir)
	if err != nil {
		fmt.Printf("%s[-] [FATAL] Could not read directory %s: %v%s\n", Red, targetDir, err, Reset)
		os.Exit(1)
	}

	var latestFile string
	var latestTime time.Time

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".zip") {
			info, err := file.Info()
			if err != nil {
				continue
			}
			if info.ModTime().After(latestTime) {
				latestTime = info.ModTime()
				latestFile = filepath.Join(targetDir, file.Name())
			}
		}
	}

	if latestFile == "" {
		fmt.Printf("%s[-] [FATAL] No .zip files found in %s%s\n", Red, targetDir, Reset)
		os.Exit(1)
	}

	fmt.Printf("%s[+] [AUTO-TARGET] Acquired target: %s%s\n", Green, latestFile, Reset)
	return latestFile
}

func extractAndValidateZip(zipPath string, dest string, requireHTML bool) error {
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return fmt.Errorf("failed to open ZIP archive: %v", err)
	}
	defer r.Close()

	hasHTML := false

	for _, f := range r.File {
		// Normalize Windows backslash separators (some students zip with \
		// instead of /). Without this, files extract as literally-named
		// "src\app.js" and the browser can't resolve ./src/app.js.
		name := strings.ReplaceAll(f.Name, "\\", "/")

		if strings.Contains(name, "node_modules/") {
			return fmt.Errorf("ZIP contains prohibited 'node_modules' directory")
		}

		if strings.HasSuffix(name, ".html") {
			hasHTML = true
		}

		fpath := filepath.Join(dest, filepath.FromSlash(name))

		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			continue
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return err
		}

		if strings.HasSuffix(name, "package.json") {
			content, _ := io.ReadAll(rc)
			if err := checkFrameworks(content); err != nil {
				outFile.Close()
				rc.Close()
				return err
			}
			rc.Close()
			rc, _ = f.Open()
		}

		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return err
		}
	}

	if requireHTML && !hasHTML {
		return fmt.Errorf("no HTML files found anywhere in the project")
	}
	return nil
}

func checkFrameworks(content []byte) error {
	var pkg PackageJSON
	if err := json.Unmarshal(content, &pkg); err != nil {
		return nil
	}

	for _, framework := range forbiddenFrameworks {
		if _, exists := pkg.Dependencies[framework]; exists {
			return fmt.Errorf("usage of prohibited framework detected: %s", framework)
		}
		if _, exists := pkg.DevDependencies[framework]; exists {
			return fmt.Errorf("usage of prohibited framework detected: %s", framework)
		}
	}
	return nil
}

// validateBeStructure checks the be/js/basic zip unpacks directly to
// final-assessment/<the 7 task folders> at shallow depth (per INSTRUCTION.md
// §2) and returns the final-assessment dir as the project root.
func validateBeStructure(tmpDir string) (string, error) {
	required := []string{
		"01-writing-comments",
		"02-code-style",
		"03-writing-test",
		"optional-04-oop",
		"optional-05-recursive",
		"optional-06-full-coverage-testing",
		"optional-07-real-world-scenario",
	}

	root := tmpDir
	entries, err := os.ReadDir(root)
	if err != nil {
		return "", fmt.Errorf("could not read extracted dir: %v", err)
	}

	// If the zip wrapped everything in a single folder, unwrap it.
	for len(entries) == 1 && entries[0].IsDir() {
		root = filepath.Join(root, entries[0].Name())
		entries, err = os.ReadDir(root)
		if err != nil {
			return "", fmt.Errorf("could not read extracted dir: %v", err)
		}
	}

	for _, dir := range required {
		info, err := os.Stat(filepath.Join(root, dir))
		if err != nil || !info.IsDir() {
			return "", fmt.Errorf("missing required folder %s (expected final-assessment/%s)", dir, dir)
		}
	}

	return root, nil
}

func resolveTargetDirectory(baseDir string) string {
	var projectRoot = baseDir
	var shortestPathLength = 9999

	err := filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}

		if !info.IsDir() && (info.Name() == "package.json" || info.Name() == "index.html") {
			dir := filepath.Dir(path)
			depth := len(strings.Split(dir, string(os.PathSeparator)))

			if depth < shortestPathLength {
				shortestPathLength = depth
				projectRoot = dir
			}
		}
		return nil
	})

	if err != nil {
		return baseDir
	}

	return projectRoot
}

func runRunner(registryKey string, targetDir string, username string) {
	executablePath, _ := os.Executable()
	baseDir := filepath.Dir(executablePath)
	runnerPath := filepath.Join(baseDir, "runner.js")

	cmd := exec.Command("node", runnerPath, registryKey, targetDir, username)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		fmt.Printf("\n%s[!] [WARNING] E2E Pipeline finished with exit code 1. Manual review required.%s\n", Yellow, Reset)
	} else {
		fmt.Printf("\n%s[+] [SUCCESS] Automated E2E pipeline executed successfully.%s\n", Green, Reset)
	}
}
