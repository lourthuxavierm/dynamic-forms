import type { FormSchema } from '@dynamic-form-engine/core';
const KEY='dynamic-forms:builder:workspace-v2',LEGACY='dynamic-forms:builder:draft';
let recoveryNotice: string | undefined;
export type FormLifecycle='Draft'|'Validated'|'Published'|'Archived';
export interface Snapshot{id:string;createdAt:string;schema:FormSchema}
export interface Release{id:string;version:number;url:string;publishedAt:string;schema:FormSchema;layout?:unknown}
export interface FormRecord{id:string;title:string;status:FormLifecycle;owner:string;permissions:readonly string[];draft:FormSchema;selectedPath?:string;updatedAt:string;archived?:boolean;snapshots:readonly Snapshot[];releases:readonly Release[];submissions:readonly Readonly<Record<string,unknown>>[];audit:readonly {at:string;action:string}[]}
interface Database{version:2;activeId:string;forms:FormRecord[]}
const clone=<T,>(value:T):T=>value === undefined ? value : JSON.parse(JSON.stringify(value)) as T;
const now=()=>new Date().toISOString();
export const starterSchema:FormSchema={id:'customer-intake',version:'1.0.0',fields:[
{name:'fullName',type:'text',label:'Full name',placeholder:'Enter full name',description:"Customer's legal full name",validation:{required:true}},
{name:'email',type:'email',label:'Work email',placeholder:'Enter work email',validation:{required:true}},
{name:'phone',type:'phone',label:'Phone number',placeholder:'Enter phone number'},
{name:'company',type:'text',label:'Company name',placeholder:'Enter company name'},
{name:'requestType',type:'select',label:'How can we help?',placeholder:'Select an option',validation:{required:true},options:[{label:'Product question',value:'product'},{label:'Support',value:'support'}]},
{name:'contactMethod',type:'radio',label:'Preferred contact method',options:[{label:'Email',value:'email'},{label:'Phone',value:'phone'},{label:'WhatsApp',value:'whatsapp'}]},
{name:'message',type:'textarea',label:'Message',placeholder:'Enter additional details...'},
{name:'subscribe',type:'switch',label:'Subscribe to updates',defaultValue:true,description:'Yes, I would like to receive product updates'}
]};
function record(schema:FormSchema,selectedPath?:string):FormRecord{const at=now();return{id:schema.id,title:schema.id,status:'Draft',owner:'local-user',permissions:['owner'],draft:clone(schema),selectedPath,updatedAt:at,snapshots:[],releases:[],submissions:[],audit:[{at,action:'Draft created'}]}}
export function loadDatabase():Database{try{const raw=localStorage.getItem(KEY);const saved=JSON.parse(raw??'') as Database;if(saved.version===2&&saved.forms?.length)return saved}catch{recoveryNotice='A corrupt workspace draft was recovered safely.'}try{const old=JSON.parse(localStorage.getItem(LEGACY)??'') as {schema:FormSchema;selectedPath?:string};if(old.schema?.fields){const migrated={version:2 as const,activeId:old.schema.id,forms:[record(old.schema,old.selectedPath)]};write(migrated);return migrated}}catch{}const first=record(starterSchema,starterSchema.fields[0]?.name);return{version:2,activeId:first.id,forms:[first]}}
function write(db:Database){localStorage.setItem(KEY,JSON.stringify(db))}
export function loadDraft(){const db=loadDatabase(),form=db.forms.find(f=>f.id===db.activeId)??db.forms[0];return{schema:form.draft,selectedPath:form.selectedPath}}
export function saveDraft(schema:FormSchema,selectedPath?:string):void{const db=loadDatabase(),at=now(),i=db.forms.findIndex(f=>f.id===db.activeId);const current=i>=0?db.forms[i]:record(schema,selectedPath);const next={...current,id:schema.id,title:schema.id,draft:clone(schema),selectedPath,updatedAt:at,status:current.status==='Archived'?'Archived':'Draft' as FormLifecycle,audit:[...current.audit,{at,action:'Draft saved'}]};if(i>=0)db.forms[i]=next;else db.forms.push(next);db.activeId=schema.id;write(db)}
export function createSnapshot(schema:FormSchema):void{const db=loadDatabase(),form=db.forms.find(f=>f.id===db.activeId);if(!form)return;const at=now();form.snapshots=[...form.snapshots,{id:`snapshot-${Date.now()}`,createdAt:at,schema:clone(schema)}];form.audit=[...form.audit,{at,action:'Snapshot created'}];write(db)}
export function publish(schema:FormSchema,layout?:unknown):Release{const db=loadDatabase(),form=db.forms.find(f=>f.id===db.activeId)??record(schema);const at=now(),version=form.releases.length+1;const release:Release={id:`${schema.id}-v${version}`,version,url:`/forms/${schema.id}/v${version}`,publishedAt:at,schema:clone(schema),layout:clone(layout)};form.releases=[...form.releases,release];form.status='Published';form.draft=clone(schema);form.updatedAt=at;form.audit=[...form.audit,{at,action:`Release v${version} published`}];if(!db.forms.includes(form))db.forms.push(form);write(db);return clone(release)}
export function listForms(){return loadDatabase().forms}
export function activateForm(id:string){const db=loadDatabase();if(db.forms.some(f=>f.id===id)){db.activeId=id;write(db)}}
export function duplicateForm(id:string){const db=loadDatabase(),source=db.forms.find(f=>f.id===id);if(!source)return;const suffix=`copy-${Date.now()}`,schema={...clone(source.draft),id:`${source.id}-${suffix}`};const copy=record(schema,schema.fields[0]?.name);db.forms.push(copy);db.activeId=copy.id;write(db);return copy}
export function archiveForm(id:string){const db=loadDatabase(),form=db.forms.find(f=>f.id===id);if(form){form.archived=true;form.status='Archived';form.audit=[...form.audit,{at:now(),action:'Form archived'}];write(db)}}
export function restoreSnapshot(id:string):FormSchema|undefined{const db=loadDatabase(),form=db.forms.find(f=>f.id===db.activeId),snap=form?.snapshots.find(s=>s.id===id);if(!form||!snap)return;form.draft=clone(snap.schema);form.status='Draft';write(db);return clone(snap.schema)}
export function rollbackRelease(id:string):FormSchema|undefined{const db=loadDatabase(),form=db.forms.find(f=>f.id===db.activeId),release=form?.releases.find(r=>r.id===id);if(!form||!release)return;form.draft=clone(release.schema);form.status='Draft';form.audit=[...form.audit,{at:now(),action:`Rolled back from v${release.version}`}];write(db);return clone(release.schema)}
export function clearDraft(){localStorage.removeItem(KEY);localStorage.removeItem(LEGACY)}

export function consumeRecoveryNotice(){const message=recoveryNotice;recoveryNotice=undefined;return message}
