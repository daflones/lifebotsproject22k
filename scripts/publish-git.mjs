import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

process.chdir(resolve(import.meta.dirname,'..'));
function git(args,allowFailure=false){
  const result=spawnSync('git',args,{encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status&&!allowFailure)throw new Error(result.stderr.trim()||`Git falhou: ${args[0]}`);
  return result;
}

const branch=git(['branch','--show-current']).stdout.trim();
if(!branch)throw new Error('Checkout em detached HEAD. Escolha uma branch.');
const origin=git(['remote','get-url','origin']).stdout.trim();
if(!/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)daflones\/lifebotsproject22k(?:\.git)?\/?$/i.test(origin)){
  throw new Error('Origin deve apontar para daflones/lifebotsproject22k.');
}
if(git(['diff','--name-only','--diff-filter=U']).stdout.trim())throw new Error('Resolva os conflitos Git antes de publicar.');
const files=git(['ls-files','--cached','--others','--exclude-standard','-z']).stdout.split('\0').filter(Boolean);
if(files.some(file=>/(^|\/)\.env(?:\.|$)|service.?role|\.backend-secrets/i.test(file)&&!/(^|\/)\.env\.example$/.test(file))){
  throw new Error('Arquivo sensível detectado. Revise o .gitignore antes de publicar.');
}
console.log(`Destino verificado: daflones/lifebotsproject22k, branch ${branch}.`);
if(!process.argv.includes('--check')){
  git(['add','--all']);
  if(git(['diff','--cached','--quiet'],true).status!==0)git(['commit','-m','Publica LifeBots 0.8: jogo, backend Supabase e assets']);
  const push=git(['push','-u','origin',branch],true);
  process.stdout.write(push.stdout);
  process.stderr.write(push.stderr);
  if(push.status)process.exit(push.status);
}
