// Original cues: layered oscillators, envelopes and pitch sweeps; no external samples.
export const EFFECT_GROUPS=[['notificationsVolume','Notificações','notification'],['collectionVolume','Coleta e recompensas','collect'],['acquisitionVolume','Aquisições','purchase'],['equipmentVolume','Montagem de peças','equip'],['progressionVolume','Evolução','upgrade'],['chatVolume','Mensagens do chat','message'],['battleVolume','Golpes, impactos e defesa','attack'],['movementVolume','Motores e movimentos','servo'],['specialVolume','Carga e especiais','special']];
export const EFFECT_CUES={
 servo:{volume:'movementVolume',notes:[[105,0,.09,.055,'triangle',215],[175,.07,.12,.035,'sine',95],[520,.05,.06,.018,'sine',310]],noise:[[0,.1,.025,1400]]},
 attack:{volume:'battleVolume',notes:[[430,0,.17,.07,'triangle',85],[72,.06,.17,.09,'sine',38],[880,.025,.06,.025,'sine',220]],noise:[[0,.13,.07,3400]]},
 hit:{volume:'battleVolume',notes:[[88,0,.22,.13,'sine',35],[190,0,.1,.055,'triangle',52],[1450,.01,.065,.025,'sine',180]],noise:[[0,.13,.10,4100]]},
 guard:{volume:'battleVolume',notes:[[210,0,.23,.055,'sine',620],[415,.08,.22,.035,'triangle',830],[1245,.14,.2,.022,'sine']],noise:[[0,.07,.025,2300]]},
 shield:{volume:'battleVolume',notes:[[155,0,.18,.055,'sine',310],[622,.02,.27,.07,'sine'],[933,.06,.3,.035,'triangle']],noise:[[.02,.1,.035,2100]]},
 block:{volume:'battleVolume',notes:[[160,0,.16,.08,'triangle',85],[740,0,.32,.065,'sine',510],[1110,.025,.29,.025,'sine']],noise:[[0,.12,.075,1700]]},
 charge:{volume:'specialVolume',notes:[[65,0,.35,.065,'sine',260],[190,.01,.4,.045,'triangle',760],[760,.12,.22,.025,'sine',1520]],noise:[[0,.35,.025,2800]]},
 special:{volume:'specialVolume',notes:[[94,0,.48,.1,'sine',35],[440,0,.3,.055,'triangle',1400],[1320,.06,.35,.04,'sine',165],[1980,.025,.17,.025,'sine',330]],noise:[[0,.3,.09,5800]]},
 knockout:{volume:'battleVolume',notes:[[150,0,.35,.08,'triangle',32],[74,.05,.44,.075,'sine',25],[880,.05,.18,.03,'sine',110]],noise:[[0,.26,.08,2500]]},
 wave:{volume:'collectionVolume',notes:[[392,0,.18,.045,'triangle'],[523.25,.12,.24,.055,'sine'],[783.99,.24,.36,.045,'sine'],[196,0,.45,.04,'sine']]},
 heal:{volume:'collectionVolume',notes:[[329.63,0,.2,.04,'sine'],[493.88,.1,.25,.035,'sine'],[659.25,.21,.32,.04,'sine'],[987.77,.26,.3,.02,'sine']]},
 start:{volume:'movementVolume',notes:[[164.81,0,.24,.05,'sine'],[329.63,.04,.16,.055,'triangle'],[493.88,.12,.22,.045,'triangle'],[659.25,.21,.3,.04,'sine']]},
 victory:{volume:'collectionVolume',notes:[[130.81,0,.7,.07,'sine'],[523.25,0,.16,.06,'triangle'],[523.25,.18,.15,.055,'triangle'],[659.25,.34,.19,.06,'triangle'],[783.99,.51,.22,.07,'triangle'],[1046.5,.71,.65,.065,'sine'],[659.25,.71,.65,.035,'sine'],[783.99,.71,.65,.035,'sine']]},
 lose:{volume:'battleVolume',notes:[[293.66,0,.3,.055,'triangle'],[261.63,.2,.38,.05,'sine'],[196,.44,.7,.055,'sine'],[98,.44,.8,.04,'sine']]},
 notification:{volume:'notificationsVolume',notes:[[659.25,0,.18,.09,'sine'],[987.77,.12,.32,.075,'sine'],[493.88,.12,.34,.035,'triangle']]},
 message:{volume:'chatVolume',notes:[[587.33,0,.085,.07,'sine'],[880,.07,.13,.045,'sine']]},
 collect:{volume:'collectionVolume',notes:[[880,0,.11,.055,'triangle'],[1174.66,.06,.13,.07,'sine'],[1396.91,.12,.15,.055,'triangle'],[1760,.18,.23,.06,'sine'],[220,0,.22,.035,'sine',330]]},
 purchase:{volume:'acquisitionVolume',notes:[[196,0,.22,.075,'sine',261.63],[523.25,.05,.18,.08,'triangle'],[659.25,.13,.2,.07,'sine'],[783.99,.21,.26,.075,'triangle'],[1046.5,.3,.4,.07,'sine'],[1567.98,.31,.27,.025,'sine']]},
 equip:{volume:'equipmentVolume',notes:[[140,0,.1,.065,'triangle',75],[440,.075,.16,.075,'triangle',660],[880,.17,.24,.06,'sine'],[1320,.18,.17,.025,'sine']]},
 upgrade:{volume:'progressionVolume',notes:[[130.81,0,.55,.055,'sine',523.25],[392,.06,.16,.07,'triangle'],[523.25,.15,.18,.08,'triangle'],[659.25,.24,.2,.07,'sine'],[783.99,.33,.25,.075,'triangle'],[1046.5,.43,.4,.06,'sine'],[1567.98,.44,.3,.025,'sine']]},
};
export function successfulActionSound(action,result,payload={}){
 if(action==='collect')return Number(result?.collectedRC??result?.amount??result)>0?'collect':null;
 if(['buy_robot','buy_part','buy_equip_part','pass','trade_accept_sale'].includes(action))return 'purchase';
 if(action==='trade_review')return payload.accept?'purchase':'notification';
 if(['upgrade_robot','upgrade_part'].includes(action))return 'upgrade';
 if(action==='equip')return 'equip';
 if(['tutorial','guild_level_claim','guild_event_claim'].includes(action))return Number(result?.rewardRC??result?.amount??result)>0?'collect':null;
 if(action==='chat_send')return 'message';
 if(['guild_create','guild_join','guild_member','admin_publish_notice','admin_guild_event_save'].includes(action))return 'notification';
 return null;
}
