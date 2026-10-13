-- Seeds are additive. Existing admin choices are not overwritten on replay.
begin;
insert into public.lr_settings(key,value,visibility) values
('deployment','{"real_money_enabled":false,"provider_contract_validated":false,"timezone":"America/Sao_Paulo","coin_minor_scale":100,"gateway_adapter":"not_implemented"}'::jsonb,'server'),
('economy','{"lcPerReal":100,"rcPerLC":10,"minWithdraw":10,"withdrawFee":0,"freeBattles":4,"passCost":80,"battleReward":80,"battleLoss":30,"tutorialBonus":300,"levelCost":120,"commissions":[5,2,1],"maxRobotLevel":10,"maxPartLevel":10}'::jsonb,'public'),
('presentation',$json${"name":"LifeBots","tagline":"Dê vida ao seu próximo capítulo.","accent":"#d5ee87","announcement":"Uma nova era está começando.","announcementBody":"Explore a Cidade Esquecida e encontre o primeiro núcleo de energia.","announcementLink":"#story","announcementImage":"","announcementButton":"Explorar história","heroTitle":"Seu robô.\nSua próxima evolução.","heroSubtitle":"Construa, explore e evolua. Um novo mundo espera pela sua equipe.","withdrawalRules":"Saques via Pix. O valor mínimo, a cotação e as taxas são exibidos antes de cada operação. O saldo fica reservado até a confirmação do gateway.","layout":"cinematic"}$json$::jsonb,'public')
on conflict(key) do nothing;

insert into public.lr_robot_catalog(id,name,robot_type,rarity,description,asset,color,price_minor,currency,daily_rc_minor,lifetime_days,max_battles,max_level,attack,defense,health,sort_order) values
('moss','MOSS-01','explorer','Comum','Um pequeno explorador com um grande futuro. Equilibrado, resistente e pronto para a primeira jornada.','moss-sprites.png','#bddf91',30000,'LC',3000,7,24,10,24,20,110,1),
('volt','VOLT-X','striker','Raro','Agilidade elétrica e precisão incomparável. Um atacante construído para desbravar a arena.','volt-sprites.png','#c3b1ee',140000,'LC',18000,30,120,10,46,26,130,2),
('titan','TITAN-9','guardian','Épico','Um guardião de aço. Sua blindagem reforçada transforma obstáculos em novos caminhos.','titan-sprites.png','#edba7d',360000,'LC',42000,45,180,10,35,58,220,3)
on conflict(id) do nothing;
insert into public.lr_part_catalog(id,name,slot,description,price_minor,currency,production_boost_bp,attack,defense,display_level,max_level) values
('core','Núcleo de plasma','core','Energia estável para uma produção maior.',45000,'RC',2000,6,0,1,10),
('arm','Braço magnético','arm','Precisão extra em cada movimento.',65000,'RC',500,14,2,1,10),
('shield','Escudo cinético','shield','Um campo protetor para enfrentar desafios.',90000,'RC',1000,0,18,1,10),
('reactor','Reator quântico','core','Tecnologia rara, potência extraordinária.',35000,'LC',4000,10,10,2,10)
on conflict(id) do nothing;
insert into public.lr_part_compatibility(part_id,robot_type) values
('core','explorer'),('core','striker'),('core','guardian'),('arm','explorer'),('arm','striker'),
('shield','guardian'),('shield','explorer'),('reactor','striker'),('reactor','guardian')
on conflict(part_id,robot_type) do nothing;
insert into public.lr_story_chapters(id,title,place,story,required_power,reward_rc_minor) values
(1,'O despertar','Arredores do hangar','Após décadas de silêncio, um pequeno robô desperta. Uma transmissão distante pede ajuda. Siga o sinal.',25,12000),
(2,'Entre as raízes','Floresta de circuitos','A natureza tomou os antigos circuitos. Encontre uma rota entre as raízes e reative o primeiro farol.',38,18000),
(3,'Cidade esquecida','Distrito Aurora','O distrito está vazio, mas suas máquinas ainda se movem. Uma patrulha protege o caminho até o núcleo.',52,26000),
(4,'O guardião','Portão de aço','Um guardião antigo bloqueia a entrada. Sua força será testada antes de avançar.',65,34000),
(5,'Além do horizonte','Vale das antenas','O sinal ganha força. Na linha do horizonte, uma nova comunidade de robôs começa a surgir.',80,48000),
(6,'Uma nova vida','Núcleo da cidade','O núcleo adormecido pode devolver energia a toda a região. Esta é a hora de reacender o futuro.',100,65000)
on conflict(id) do nothing;
commit;
