#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File fixes to apply
const fixes = [
  // Fix Settings.tsx
  {
    file: 'src/pages/Settings.tsx',
    replacements: [
      {
        from: /user\.user_metadata/g,
        to: 'user.unsafeMetadata'
      },
      {
        from: /user\.email/g,
        to: 'user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress'
      }
    ]
  },
  
  // Fix FamilyInvitation.tsx
  {
    file: 'src/pages/FamilyInvitation.tsx',
    replacements: [
      {
        from: /user\.email/g,
        to: 'user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress'
      }
    ]
  },
  
  // Fix FocusMode.tsx
  {
    file: 'src/pages/FocusMode.tsx',
    replacements: [
      {
        from: /category: 'general'/g,
        to: 'type: "general"'
      }
    ]
  },
  
  // Fix Family.tsx - add missing imports
  {
    file: 'src/pages/Family.tsx',
    replacements: [
      {
        from: /import { useAuth } from '.\/\.\.\/context\/AuthContextClerk';/,
        to: 'import { useAuth } from "../context/AuthContextClerk";\nimport { FamilyMember, SharedTask } from "../types/database";'
      }
    ]
  }
];

console.log('🔧 Applying TypeScript fixes...');

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${fix.file}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    fix.replacements.forEach(replacement => {
      content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fix.file}`);
  } else {
    console.log(`❌ File not found: ${fix.file}`);
  }
});

console.log('🎉 All fixes applied!');