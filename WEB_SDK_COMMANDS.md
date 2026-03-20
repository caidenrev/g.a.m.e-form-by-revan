# 🚀 Web SDK Scripts - Commands & Functions

## 📋 Available Scripts

### 1. **check-member-names-web.js** - Member Validation
```bash
node check-member-names-web.js
```
**Fungsi:**
- ✅ Cek semua member di Firestore vs database resmi
- ✅ Validasi nama dengan similarity algorithm
- ✅ Generate report JSON dengan statistik
- ✅ Kategorisasi: correct, needs_correction, not_found, mismatch

**Output:**
- Console: Progress dan summary
- File: `check-member-names-report-*.json`

---

### 2. **delete-member-by-gsaid-web.js** - Single Delete
```bash
node delete-member-by-gsaid-web.js
```
**Fungsi:**
- 🗑️ Delete satu member berdasarkan GSA ID
- 🔍 Search dan preview member sebelum delete
- 🔒 Double confirmation (ketik "HAPUS" + y/n)
- 📊 Real-time success/error reporting

**Interactive Flow:**
1. Input GSA ID (auto-uppercase)
2. Preview member details
3. Konfirmasi "HAPUS"
4. Konfirmasi final y/n
5. Delete dan report hasil

---

### 3. **delete-members-batch-web.js** - Batch Delete
```bash
node delete-members-batch-web.js
```
**Fungsi:**
- 🗑️ Delete multiple members sekaligus
- 📝 Input manual (comma-separated) atau dari file
- 🔄 Batch processing (500 operations limit)
- 📊 Progress tracking per batch
- 📄 Generate deletion report JSON

**Input Methods:**
- **Manual:** `GSAID25001, GSAID25002, GSAID25003`
- **File:** Create `gsaids-to-delete.txt` dengan satu GSA ID per baris

**Output:**
- Console: Progress dan summary
- File: `deletion-report-*.json`

---

## 🎯 Quick Commands

### Check Members
```bash
# Validasi semua member
node check-member-names-web.js
```

### Delete Single Member
```bash
# Delete satu member
node delete-member-by-gsaid-web.js
```

### Delete Multiple Members
```bash
# Delete batch members
node delete-members-batch-web.js
```

### Launcher Menu
```bash
# Windows
delete-members.bat

# Linux/Mac
./delete-members.sh
```

---

## 📊 Script Functions Summary

| Script | Purpose | Input | Output | Safety |
|--------|---------|-------|--------|--------|
| **check-member-names-web.js** | Validate member data | Auto (all members) | JSON report | Read-only |
| **delete-member-by-gsaid-web.js** | Delete single member | Interactive GSA ID | Console log | Double confirm |
| **delete-members-batch-web.js** | Delete multiple members | Manual/File GSA IDs | JSON report | Double confirm |

---

## 🔧 Common Features

### All Scripts Include:
- ✅ Firebase Web SDK connection
- ✅ GSA ID uppercase normalization
- ✅ Connection testing
- ✅ Error handling dengan specific messages
- ✅ Progress tracking
- ✅ Detailed logging

### Safety Features:
- 🔒 Double confirmation untuk delete operations
- 📋 Member preview sebelum delete
- 📊 Success/error counting
- 📄 Audit trail dengan JSON reports

---

## 🚀 Workflow Recommendations

### Development:
```bash
# 1. Check data quality
node check-member-names-web.js

# 2. Test single delete
node delete-member-by-gsaid-web.js

# 3. Batch cleanup if needed
node delete-members-batch-web.js
```

### Production:
```bash
# 1. Always backup first
node backup-members.js

# 2. Check data
node check-member-names-web.js

# 3. Delete operations
node delete-members-batch-web.js
```

---

## 📝 Input Formats

### GSA ID Format:
- **Input:** `gsaid25001` atau `GSAID25001`
- **Auto-convert:** `GSAID25001` (uppercase)

### Batch Input Methods:

#### Manual Input:
```
Masukkan GSA IDs: gsaid25001, gsaid25002, gsaid25003
```

#### File Input (`gsaids-to-delete.txt`):
```
gsaid25001
gsaid25002
gsaid25003
```

---

## 📊 Output Files

### Reports Generated:
- `check-member-names-report-*.json` - Validation results
- `deletion-report-*.json` - Deletion audit trail
- `members-backup-*.json` - Backup files (if created)

### Report Contents:
```json
{
  "timestamp": "2024-03-20T10:30:00.000Z",
  "summary": {
    "total": 150,
    "correct": 120,
    "needsCorrection": 25,
    "deleted": 5
  },
  "details": [...]
}
```

---

## ⚡ Performance Notes

### Batch Limits:
- **Firestore:** 500 operations per batch
- **Auto-split:** Large datasets automatically chunked
- **Progress:** Real-time batch progress tracking

### Connection:
- **Reuse:** Single Firebase connection per script
- **Test:** Connection tested before operations
- **Timeout:** Graceful handling untuk network issues

---

## 🔒 Security & Safety

### Confirmation Levels:
1. **Preview:** Show member details
2. **Type "HAPUS":** Specific confirmation text
3. **Final y/n:** Last chance to cancel

### Data Protection:
- **Read-only:** Check script tidak mengubah data
- **Backup reminder:** Delete scripts remind to backup
- **Audit trail:** All operations logged to JSON

### Error Handling:
- **Permission denied:** Firestore rules guidance
- **Network errors:** Retry suggestions
- **Invalid input:** Clear error messages

---

## 💡 Tips & Best Practices

### Before Running:
1. Ensure `.env.local` configured
2. Check Firestore Rules allow operations
3. Backup data if doing delete operations

### During Operations:
1. Monitor console output for errors
2. Don't interrupt batch operations
3. Keep deletion reports for audit

### After Operations:
1. Verify results in Firebase Console
2. Save reports for future reference
3. Monitor Firebase quota usage
