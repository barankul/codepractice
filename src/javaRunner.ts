// Java実行 — Java code runner
import * as vscode from "vscode";
import { spawn, execSync } from "child_process";
import { CoreResult } from "./constants";
import { getResponseLang, getSecret } from "./aiHelpers";

const MAX_OUTPUT_SIZE = 1_000_000;
const CORE_TIMEOUT_MS = 120_000;

let _jdkChecked = false;
let _jdkAvailable = false;

/** JDK確認 — check if JDK is available */
export async function checkJdk(): Promise<boolean> {
  if (_jdkChecked && _jdkAvailable) { return true; }
  _jdkChecked = true;
  try {
    const result = await new Promise<boolean>((resolve) => {
      const p = spawn("javac", ["-version"], { windowsHide: true });
      p.on("error", () => resolve(false));
      p.on("close", (code) => resolve(code === 0));
    });
    _jdkAvailable = result;
  } catch {
    _jdkAvailable = false;
  }
  return _jdkAvailable;
}

/** JDKインストール案内 — show JDK install guidance + auto-install option */
export async function promptJdkInstall(): Promise<void> {
  const platform = process.platform; // win32, darwin, linux
  const canAutoInstall = platform === "win32" || platform === "darwin" || platform === "linux";

  const options = canAutoInstall
    ? ["Install JDK Now", "Open Download Page", "Dismiss"]
    : ["Open Download Page", "Dismiss"];

  const choice = await vscode.window.showErrorMessage(
    "Java Development Kit (JDK) is required but not found. Install JDK 21 to use Java features.",
    ...options
  );

  if (choice === "Install JDK Now") {
    await installJdkInTerminal();
  } else if (choice === "Open Download Page") {
    vscode.env.openExternal(vscode.Uri.parse("https://adoptium.net/"));
  }
}

/** ターミナルでJDKインストール — install JDK via terminal using platform package manager */
async function installJdkInTerminal(): Promise<void> {
  const platform = process.platform;
  let command: string;
  let shellName: string;

  if (platform === "win32") {
    // Check if winget is available
    let hasWinget = false;
    try { execSync("winget --version", { windowsHide: true }); hasWinget = true; } catch {}

    if (hasWinget) {
      command = "winget install EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements";
      shellName = "JDK Install (winget)";
    } else {
      // Fallback: use PowerShell to download and run MSI
      command =
        `Write-Host "Downloading JDK 21..." -ForegroundColor Cyan ; ` +
        `$url = "https://api.adoptium.net/v3/installer/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk" ; ` +
        `$msi = "$env:TEMP\\jdk21.msi" ; ` +
        `Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing ; ` +
        `Write-Host "Installing JDK 21..." -ForegroundColor Cyan ; ` +
        `Start-Process msiexec.exe -ArgumentList "/i",$msi,"/quiet","ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJarFileRunWith,FeatureJavaHome,FeatureOracleJavaSoft" -Wait ; ` +
        `Remove-Item $msi ; ` +
        `Write-Host "Done! Restart VS Code to use Java." -ForegroundColor Green`;
      shellName = "JDK Install (download)";
    }
  } else if (platform === "darwin") {
    // Check if brew is available
    let hasBrew = false;
    try { execSync("brew --version", { windowsHide: true }); hasBrew = true; } catch {}

    if (hasBrew) {
      command = "brew install --cask temurin@21 && echo '\\nDone! Restart VS Code to use Java.'";
      shellName = "JDK Install (brew)";
    } else {
      command =
        `echo "Downloading JDK 21..." && ` +
        `curl -Lo /tmp/jdk21.pkg "https://api.adoptium.net/v3/installer/latest/21/ga/mac/$(uname -m | sed 's/arm64/aarch64/')/jdk/hotspot/normal/eclipse?project=jdk" && ` +
        `echo "Installing JDK 21 (may ask for password)..." && ` +
        `sudo installer -pkg /tmp/jdk21.pkg -target / && ` +
        `rm /tmp/jdk21.pkg && ` +
        `echo "Done! Restart VS Code to use Java."`;
      shellName = "JDK Install (download)";
    }
  } else {
    // Linux: try apt, then dnf, then direct download
    let pkgManager = "";
    try { execSync("apt --version 2>/dev/null", { windowsHide: true }); pkgManager = "apt"; } catch {}
    if (!pkgManager) {
      try { execSync("dnf --version 2>/dev/null", { windowsHide: true }); pkgManager = "dnf"; } catch {}
    }

    if (pkgManager === "apt") {
      command =
        `echo "Installing JDK 21 via apt..." && ` +
        `sudo apt update && sudo apt install -y temurin-21-jdk || ` +
        `(echo "Adding Adoptium repo..." && ` +
        `sudo apt install -y wget apt-transport-https gpg && ` +
        `wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmor -o /usr/share/keyrings/adoptium.gpg && ` +
        `echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list && ` +
        `sudo apt update && sudo apt install -y temurin-21-jdk) && ` +
        `echo "Done! Restart VS Code to use Java."`;
      shellName = "JDK Install (apt)";
    } else if (pkgManager === "dnf") {
      command = `sudo dnf install -y java-21-openjdk-devel && echo "Done! Restart VS Code to use Java."`;
      shellName = "JDK Install (dnf)";
    } else {
      command =
        `echo "Downloading JDK 21..." && ` +
        `curl -Lo /tmp/jdk21.tar.gz "https://api.adoptium.net/v3/binary/latest/21/ga/linux/$(uname -m | sed 's/x86_64/x64/' | sed 's/aarch64/aarch64/')/jdk/hotspot/normal/eclipse?project=jdk" && ` +
        `sudo mkdir -p /opt/jdk && ` +
        `sudo tar -xzf /tmp/jdk21.tar.gz -C /opt/jdk --strip-components=1 && ` +
        `rm /tmp/jdk21.tar.gz && ` +
        `echo 'export JAVA_HOME=/opt/jdk' | sudo tee /etc/profile.d/jdk.sh && ` +
        `echo 'export PATH=$JAVA_HOME/bin:$PATH' | sudo tee -a /etc/profile.d/jdk.sh && ` +
        `echo "Done! Run: source /etc/profile.d/jdk.sh  or restart VS Code."`;
      shellName = "JDK Install (download)";
    }
  }

  const terminal = vscode.window.createTerminal({ name: shellName });
  terminal.show();
  terminal.sendText(command);

  // Reset JDK check cache so next attempt re-checks
  _jdkChecked = false;
  _jdkAvailable = false;
}

/** AI環境設定取得 — get AI provider env config */
async function getAiEnvConfig(): Promise<Record<string, string>> {
  const cfg = vscode.workspace.getConfiguration("codepractice");
  const provider = cfg.get<string>("aiProvider") || "local";
  const aiEndpoint = cfg.get<string>("aiEndpoint") || "";
  const groqModel = cfg.get<string>("groqModel") || "openai/gpt-oss-120b";
  const geminiModel = cfg.get<string>("geminiModel") || "gemini-2.5-flash";

  const env: Record<string, string> = {};
  env.CODETEACHER_AI_PROVIDER = provider;

  if (provider === "groq") {
    env.CODETEACHER_GROQ_API_KEY = await getSecret("groqApiKey");
    env.CODETEACHER_GROQ_MODEL = groqModel;
  } else if (provider === "gemini") {
    env.CODETEACHER_GEMINI_API_KEY = await getSecret("geminiApiKey");
    env.CODETEACHER_GEMINI_MODEL = geminiModel;
  } else if (provider === "cerebras") {
    env.CODETEACHER_ENDPOINT_API_KEY = await getSecret("endpointApiKey");
    env.CODETEACHER_AI_ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";
    env.CODETEACHER_AI_MODEL = cfg.get<string>("cerebrasModel") || "qwen-3-235b-a22b-instruct-2507";
  } else if (provider === "together") {
    env.CODETEACHER_ENDPOINT_API_KEY = await getSecret("endpointApiKey");
    env.CODETEACHER_AI_ENDPOINT = "https://api.together.xyz/v1/chat/completions";
    env.CODETEACHER_AI_MODEL = cfg.get<string>("togetherModel") || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  } else if (provider === "openrouter") {
    env.CODETEACHER_ENDPOINT_API_KEY = await getSecret("endpointApiKey");
    env.CODETEACHER_AI_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    env.CODETEACHER_AI_MODEL = cfg.get<string>("openrouterModel") || "nvidia/nemotron-3-super-120b-a12b:free";
  } else {
    if (aiEndpoint.trim().length > 0) {
      env.CODETEACHER_AI_ENDPOINT = aiEndpoint.trim();
    }
    const endpointApiKey = await getSecret("endpointApiKey");
    if (endpointApiKey) {
      env.CODETEACHER_ENDPOINT_API_KEY = endpointApiKey;
    }
  }

  return env;
}

/** Java実行 — compile and run Java code */
export async function runJavaCore(
  context: vscode.ExtensionContext,
  lang: string,
  topic: string,
  level: number = 1,
  history: string[] = [],
  mode: string = "normal"
): Promise<CoreResult> {
  const aiEnv = await getAiEnvConfig();

  if (!(await checkJdk())) {
    await promptJdkInstall();
    throw new Error("JDK not found. Install JDK 17+ and restart VS Code.");
  }

  return new Promise((resolve, reject) => {
    const jarName = mode === "debug" ? "codepractice-debug.jar" : "codepractice-core.jar";
    const jarPath = context.asAbsolutePath(`core-java/dist/${jarName}`);

    const env = { ...process.env, ...aiEnv };
    env.CODETEACHER_LEVEL = String(level);
    env.CODETEACHER_HISTORY = history.join("|||");
    env.CODETEACHER_UI_LANG = getResponseLang();
    console.log("[CodePractice] runJavaCore UI_LANG =", getResponseLang());

    let settled = false;

    const p = spawn("java", ["-Dfile.encoding=UTF-8", "-jar", jarPath, lang, topic], {
      windowsHide: true,
      env
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        p.kill("SIGKILL");
        reject(new Error(`Java core process timed out after ${CORE_TIMEOUT_MS / 1000}s`));
      }
    }, CORE_TIMEOUT_MS);

    let out = "";
    let err = "";

    p.stdout?.on("data", (d) => { if (out.length < MAX_OUTPUT_SIZE) out += d.toString(); });
    p.stderr?.on("data", (d) => { if (err.length < MAX_OUTPUT_SIZE) err += d.toString(); });

    p.on("error", (e: Error) => {
      if (settled) { return; }
      settled = true;
      clearTimeout(timer);
      reject(new Error(`Failed to spawn Java process: ${e.message}. Is Java installed?`));
    });

    p.on("close", (code) => {
      if (settled) { return; }
      settled = true;
      clearTimeout(timer);

      if (err) { console.log("[CodePractice] Java stderr:", err); }
      if (code !== 0) { return reject(new Error(err || `core exited with code ${code}`)); }

      const cleaned = out.replace(/^(?:DEBUG|INFO|WARN|LOG|TRACE|FINE|FINER|FINEST)\b[^\n]*\n?/gmi, "");
      const jsonStart = cleaned.indexOf("{");
      if (jsonStart === -1) { return reject(new Error("No JSON found in core output:\n" + out.slice(0, 400))); }

      const jsonText = cleaned.substring(jsonStart).trim();
      try {
        resolve(JSON.parse(jsonText));
      } catch {
        reject(new Error("JSON parse failed. First 400 chars:\n" + jsonText.slice(0, 400)));
      }
    });
  });
}
