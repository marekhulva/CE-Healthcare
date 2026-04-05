# Commvault Product Context
**For use in system prompts — do not share externally**
**Last Updated:** 2026-04-05

---

## What Commvault Is

Commvault is a **software and SaaS vendor** for backup and data protection across on-prem, hybrid, cloud, and multi-cloud environments. But the framing is bigger than backup:

> **"What can a customer do AFTER a cyber or natural disaster? How do they get back up as fast as possible?"**

This is a **business continuity** story, not just a backup story. The core question Commvault answers: *if everything gets encrypted in a ransomware attack, how do you recover your business?*

---

## Core Capabilities

### Data Protection & Backup
- Software and SaaS backup for on-prem, hybrid, cloud, multi-cloud
- Scans data **before backup, during backup, and after** — threats are caught at every stage
- **Immutable storage** — backed-up data cannot be altered or deleted
- **Air-gapped storage** — isolated, immutable bucket completely cut off from the network; even if attackers encrypt everything, data in air-gapped storage is safe ("crown jewels always protected")

### Cleanroom Recovery
- Ability to spin up a **completely new cloud environment on demand** after a ransomware attack
- Recover mission-critical data into a clean, isolated environment
- Eliminates the risk of recovering into a still-compromised environment

### Active Directory Protection
- Not just backup of AD — full ability to **stand up Active Directory from scratch** during a disaster
- Key selling point: average manual AD forest rebuild takes **5–7 days**
- During that time the entire org is effectively down (nothing works without AD/Entra ID)
- Commvault dramatically reduces that window

### Microsoft 365, Google Workspace & Salesforce Backup
- Backs up data from M365, Google Workspace, and Salesforce into **air-gapped storage**
- Includes **compliance search** — ability to search and retrieve data from those backups for legal/compliance purposes

### Cloud Rewind
- Takes **snapshots of the full cloud environment** (infrastructure + data)
- During a disaster: restores entire cloud infrastructure from scratch in minutes
- Think "Infrastructure as Code" but with automatic snapshots — no manual scripting required
- Restores not just data but the full cloud environment configuration

### Risk Analysis
- Discovers, classifies, and manages **sensitive data** across live and backup environments
- Scans for PII, intellectual property, API keys, secrets
- Identifies **access control gaps** and over-permissioned access
- Detects data sprawl, redundant/obsolete/trivial (ROT) data
- Compliance reporting for GDPR, CCPA, and other privacy regulations
- Full-text search including metadata, file contents, OCR on images
- Reduces exposure before a breach happens — this is a **pre-incident** capability

---

## Still Need From Marek
- [ ] Target verticals in priority order
- [ ] Company size / market segment (mid-market, enterprise, both?)
- [ ] How do they typically lose deals? (vs. Rubrik, Veeam, Cohesity)
- [ ] Geography — US only or global?
- [ ] Tone for summaries — technical SE level or AE-readable too?
