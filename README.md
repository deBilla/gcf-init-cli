# Cloud Functions Init CLI With Boilerplate (`cf-cli`)

A simple CLI tool to initialize a Firebase project with a custom boilerplate, add modules, and add Firebase services.

## 🚀 Features

- Initializes a Firebase project with a predefined boilerplate.
- Adds modules to an existing Firebase project.
- Adds Firebase services (e.g., Firestore, Functions) to the project.
- Fully written in TypeScript.

---

## 📦 Installation

### **Install Globally**
To install the CLI globally, run:

```bash
npm install -g cf-cli
```

## 🔧 Usage
Run the CLI by using the following command:

```
cf-cli <command> [options]
```

## Commands:
Initialize the project

```
cf-cli init <project-name>
```

Go inside the project to functions folder

```
cd <project-name>/functions
```

Install dependencies

```
yarn install
```

Add a Module

```
cf-cli add module user
```



