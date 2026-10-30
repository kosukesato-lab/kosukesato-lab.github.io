/**
 * Return the records visible in the selected content mode.
 * Draft records remain available in demo mode and are omitted in production.
 * @template {{draft: boolean}} T
 * @param {T[]} records
 * @param {string} contentMode
 * @returns {T[]}
 */
export function visibleRecords(records,contentMode){
 return records.filter(record=>contentMode==='demo'||!record.draft);
}
