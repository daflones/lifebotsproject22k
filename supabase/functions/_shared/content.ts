import * as Core from '../../../src/core.js';
import {ApiError} from './response.ts';
export function validatedContent(body: Record<string,unknown>,snapshot: Record<string,unknown>){
 const kinds=['robot','part','chapter','season','settings','arenaRoster'];
 const present=kinds.filter(k=>body[k]!==undefined);if(present.length!==1)throw new ApiError(400,'INVALID_CONTENT','Envie uma alteração de conteúdo por vez.');
 const kind=present[0],state=Core.clone(snapshot),value=Core.clone(body[kind]);
 try{
  if(kind==='robot')Core.validateRobot(value);
  if(kind==='part')Core.validatePart(value);
  if(kind==='chapter')Core.saveChapter(state,value);
  if(kind==='season')Core.saveSeason(state,value);
  if(kind==='arenaRoster')Core.validateArenaRoster(state,value);
  if(kind==='settings'){for(const key of Object.keys(value))if(!Object.hasOwn(Core.DEFAULT_SETTINGS,key))delete value[key];Core.validateSettings(value);}
 }catch(e){throw new ApiError(400,'INVALID_CONTENT',e instanceof Error?e.message:'Conteúdo inválido.');}
 return {kind,value};
}
