import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleRecords} from '../src/lib/visibility.mjs';

const records=[
 {id:'public',draft:false,status:'published'},
 {id:'draft',draft:true,status:'published'},
];

test('production excludes drafts even when their publication status is published',()=>{
 assert.deepEqual(visibleRecords(records,'production').map(record=>record.id),['public']);
});

test('demo includes drafts without changing the source records',()=>{
 const before=structuredClone(records);
 assert.deepEqual(visibleRecords(records,'demo').map(record=>record.id),['public','draft']);
 assert.deepEqual(records,before);
});
