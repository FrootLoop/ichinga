-- Fix Persian translation name: was stored in visual order (یسراف), correct to logical order (فارسی)
UPDATE translations SET name = 'فارسی' WHERE id = 'fa';
