/** @param {{year:string,type:string,search:string}} entry @param {{year:string,type:string,query:string}} filters */
export function matchesPublication(entry,filters){
 const query=filters.query.trim().toLocaleLowerCase();
 return (!filters.year||entry.year===filters.year)&&(!filters.type||entry.type===filters.type)&&entry.search.toLocaleLowerCase().includes(query);
}
