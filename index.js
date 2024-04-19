#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
// import shell from "shelljs";
import cowsay from "cowsay";
import path from "path";
import fs from "fs";
import ora from "ora";
import { exec, execSync } from "child_process";

function mainConfig(text) {
  return {
    message: chalk.yellowBright(text),
    prefix: chalk.greenBright("> "),
  };
}

function showWelcome() {
  console.log(
    chalk.blueBright(
      cowsay.say({
        text: "Welcome to Typescript Starter!",
        e: "oO",
        T: "U ",
      })
    )
  );

  console.log(chalk.greenBright("By spectreThug :)"));
}

function projectName() {
  return inquirer.prompt([
    {
      type: "input",
      name: "PROJECT_NAME",
      ...mainConfig("What name would you like to use for the new project?"),
      validate: function (val) {
        if (!val.length) return "Please enter a project name";
        const canCreateDirectory = path.join(process.cwd(), val);
        if (fs.existsSync(canCreateDirectory)) return "Project already exists";
        return true;
      },
    },
  ]);
}

function createDirectory(directoryName) {
  const canCreateDirectory = path.join(process.cwd(), directoryName);
  return fs.promises.mkdir(canCreateDirectory, { recursive: true });
}

async function createRootFiles(directoryName) {
  const rootDir = path.join(process.cwd(), directoryName);

  await fs.promises.writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: directoryName,
        version: "1.0.0",
        description: "A typescript starter project",
        main: "index.js",
        scripts: {
          "start:dev": "npx nodemon",
          start: "npx ts-node ./src/index.ts",
        },
        keywords: [],
        author: "",
        license: "ISC",
      },
      null,
      4
    )
  );

  await fs.promises.writeFile(
    path.join(rootDir, "nodemon.json"),
    JSON.stringify(
      {
        watch: ["src"],
        ext: ".ts,.js",
        ignore: [],
        exec: "npx ts-node ./src/index.ts",
      },
      null,
      4
    )
  );

  await fs.promises.writeFile(
    path.join(rootDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          module: "commonjs",
          lib: ["es6"],
          allowJs: true,
          outDir: "build",
          rootDir: "src",
          strict: true,
          noImplicitAny: true,
          esModuleInterop: true,
          resolveJsonModule: true,
        },
      },
      null,
      4
    )
  );

  await fs.promises.writeFile(
    path.join(rootDir, "ecosystem.config.js"),
    `//pm2 start ecosystem.config.js --env [env name]
//ref: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: '${directoryName}',
      script: 'dist/main.js',
      env_production: {
        NODE_ENV: 'Production',
      },
      env_development: {
        NODE_ENV: 'Development',
      },
    },
  ],
};
`
  );
  await fs.promises.writeFile(
    path.join(rootDir, ".gitignore"),
    `# compiled output
/dist
/node_modules
/build

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# temp directory
.temp
.tmp

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
`
  );

  await fs.promises.writeFile(
    path.join(rootDir, ".eslintrc.js"),
    `module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
`
  );
}

async function createSrcFiles(directoryName) {
  const rootDir = path.join(process.cwd(), directoryName);

  await fs.promises.mkdir(path.join(rootDir, "src"), { recursive: true });

  await fs.promises.writeFile(
    path.join(rootDir, "src", "index.ts"),
    `console.log("Hello World!");`
  );
}

export async function execute(command, options, callback) {
  return new Promise((resolve, reject) => {
    exec(command, { ...options }, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      }
      resolve(callback(stdout));
    });
  });
}

async function installDependencies(directoryName) {
  await execute(
    "npm i --save-dev @types/node nodemon ts-node typescript",
    {
      cwd: path.join(process.cwd(), directoryName),
    },
    function (output) {}
  );
}

async function main() {
  showWelcome();
  const { PROJECT_NAME } = await projectName();
  const spinner = ora({
    text: chalk.greenBright("Creating project"),
    spinner: "line",
    color: "green",
  }).start();

  await createDirectory(PROJECT_NAME);
  await createRootFiles(PROJECT_NAME);
  await createSrcFiles(PROJECT_NAME);
  await installDependencies(PROJECT_NAME);
  spinner.stop();

  console.log(
    chalk.greenBright(
      `Project ${chalk.blueBright(PROJECT_NAME)} created successfully!`
    )
  );

  console.log(
    chalk.blueBright(
      `\nTo start the project run\n\n${chalk.greenBright(
        `$ cd ${PROJECT_NAME}\n$ npm run start:dev`
      )}`
    )
  );
}

main();
