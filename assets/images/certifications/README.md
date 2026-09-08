# Certification badges

Upload certification badge images to this folder, then add each file path to the matching certification's `badgeUrl` in `data/resume.json`.

Example:

```json
"badgeUrl": "assets/images/certifications/aws-ai-practitioner.png"
```

Square PNG or WebP images with transparent backgrounds work best.

## Add a new certification

Use the repository helper so the badge and certification details are always added together:

```bash
node scripts/add-certification.mjs \
  --name "Professional Scrum Product Owner™ II (PSPO II)" \
  --issuer "Scrum.org" \
  --badge "/path/to/badge.png" \
  --credential-url "https://www.credly.com/earner/earned/badge/..." \
  --study-guide-url "https://github.com/.../study-guide.pdf" \
  --resume "/path/to/updated-resume.docx"
```

The command performs the complete certification workflow:

1. Copies the badge into `assets/images/certifications/` using a consistent filename.
2. Adds the name, issuer, local badge path, credential link, and optional study-guide link to the `certifications` category in `data/resume.json`.
3. When `--resume` is supplied, replaces the downloadable resume at the path configured by `resumeUrl`.

Use `--position bottom` to append instead of placing the newest certification first. The credential link makes the certification title clickable. `--study-guide-url` and `--resume` are optional.
