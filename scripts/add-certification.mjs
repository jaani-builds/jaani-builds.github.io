#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : "";
};

const name = getArg("name");
const issuer = getArg("issuer");
const badgeSource = getArg("badge");
const credentialUrl = getArg("credential-url");
const studyGuideUrl = getArg("study-guide-url");
const resumeSource = getArg("resume");
const position = getArg("position") || "top";

if (!name || !issuer || !badgeSource) {
  console.error(
    'Usage: node scripts/add-certification.mjs --name "Certification" --issuer "Issuer" --badge "/path/to/badge.png" [--credential-url "https://..."] [--study-guide-url "https://..."] [--resume "/path/to/updated-resume.docx"] [--position top|bottom]',
  );
  process.exit(1);
}

const root = process.cwd();
const dataPath = path.join(root, "data/resume.json");
const badgeDirectory = path.join(root, "assets/images/certifications");
const sourcePath = path.resolve(badgeSource);
const resumeSourcePath = resumeSource ? path.resolve(resumeSource) : "";

if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
  console.error(`Badge file not found: ${sourcePath}`);
  process.exit(1);
}

if (resumeSourcePath && (!fs.existsSync(resumeSourcePath) || !fs.statSync(resumeSourcePath).isFile())) {
  console.error(`Resume file not found: ${resumeSourcePath}`);
  process.exit(1);
}

const slug = name
  .normalize("NFKD")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();
const extension = path.extname(sourcePath).toLowerCase() || ".png";
const badgeFilename = `${slug}${extension}`;
const destinationPath = path.join(badgeDirectory, badgeFilename);
const badgeUrl = `assets/images/certifications/${badgeFilename}`;

const resume = JSON.parse(fs.readFileSync(dataPath, "utf8"));
resume.certifications ||= [];
const resumeDestinationPath = path.resolve(root, resume.resumeUrl || "assets/resume/Jaani_Francis_Nickolas_Resume.docx");

if (!resumeDestinationPath.startsWith(`${root}${path.sep}`)) {
  console.error(`Configured resumeUrl must point inside the repository: ${resume.resumeUrl}`);
  process.exit(1);
}

if (resume.certifications.some((item) => item.name === name)) {
  console.error(`Certification already exists: ${name}`);
  process.exit(1);
}

fs.mkdirSync(badgeDirectory, { recursive: true });
if (sourcePath !== destinationPath) {
  fs.copyFileSync(sourcePath, destinationPath, fs.constants.COPYFILE_EXCL);
}

if (resumeSourcePath && resumeSourcePath !== resumeDestinationPath) {
  fs.mkdirSync(path.dirname(resumeDestinationPath), { recursive: true });
  fs.copyFileSync(resumeSourcePath, resumeDestinationPath);
}

const certification = {
  name,
  issuer,
  badgeUrl,
  credentialUrl,
  studyGuideUrl,
};

if (position === "bottom") {
  resume.certifications.push(certification);
} else {
  resume.certifications.unshift(certification);
}

fs.writeFileSync(dataPath, `${JSON.stringify(resume, null, 2)}\n`);
console.log(`Added ${name}`);
console.log(`Badge: ${badgeUrl}`);
if (resumeSourcePath) {
  console.log(`Resume: ${path.relative(root, resumeDestinationPath)}`);
}
