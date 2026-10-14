import { requireAdmin, requireUser, serverClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ApiError, errorResponse, jsonResponse, readJson } from "../_shared/response.ts";
import {executeGameAction} from '../_shared/runtime/service.ts';
import {paymentAction} from '../_shared/mercosulpay.ts';
import {validatedContent} from '../_shared/content.ts';
import {publicAppearance} from '../_shared/public-content.js';

const pendingActions = new Set([
 "admin_delete","admin_payments_policy","select_robot","payment_status","profile","tutorial_step","story_start","story_enter","story_move","story_next","story_finish","story_cancel",
  "buy_robot", "buy_part", "buy_equip_part", "equip", "upgrade_robot", "upgrade_part", "collect", "convert",
  "deposit", "withdraw", "tutorial", "story", "battle", "pass", "admin_save",
  "admin_users", "admin_user_detail", "admin_adjust_balance", "admin_update_robot", "admin_review_withdrawal", "admin_deposits", "admin_withdrawals", "admin_publish_notice",
  "guild_conquest_order", "guild_conquest_claim", "social_snapshot", "chat_send", "guild_create", "guild_join", "guild_member", "guild_find_battle", "guild_move", "guild_finish", "guild_level_claim", "guild_event_claim",
  "trade_create", "trade_cancel", "trade_accept_sale", "trade_propose", "trade_review",
  "admin_social_settings", "admin_guild_event_save", "admin_chat_mute", "admin_chat_remove", "admin_guilds", "admin_trades", "admin_chat_messages",
  "arena_find_match", "arena_cancel_match", "arena_poll_match", "arena_move", "arena_finish",
  "coupon_redeem", "admin_coupon_save", "admin_coupon_delete",
]);

Deno.serve(async (request: Request) => {
  let headers: Record<string, string> = {};
  try {
    headers = corsHeaders(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") throw new ApiError(405, "METHOD_NOT_ALLOWED", "Use POST.");
    const body = await readJson(request);
    if (typeof body.action !== "string") throw new ApiError(400, "ACTION_REQUIRED", "Ação inválida.");
    if(body.action==='public_config'){
      const client=serverClient();
      const [presentation,robots]=await Promise.all([client.from('lr_settings').select('value').eq('key','presentation').single(),client.from('lr_robot_catalog').select('id,name,robot_type,rarity,description,asset,color,identity').eq('active',true)]);
      if(presentation.error||robots.error)throw new ApiError(503,'CONTENT_LOAD_FAILED','Não foi possível carregar o visual do jogo.');
      const appearance=publicAppearance(presentation.data.value,robots.data.map(r=>({...r,type:r.robot_type}))),media=appearance.mediaRefs.length?await client.from('lr_media').select('ref,kind,path').in('ref',appearance.mediaRefs):{data:[],error:null};
      if(media.error)throw new ApiError(503,'MEDIA_LOAD_FAILED','Não foi possível carregar as imagens.');
      return jsonResponse({ok:true,data:{settings:appearance.settings,catalog:appearance.catalog,media:(media.data||[]).map(r=>({ref:r.ref,kind:r.kind,url:client.storage.from('lr-media').getPublicUrl(r.path).data.publicUrl}))}},200,headers);
    }
    const user = await requireUser(request);
    if (body.mode !== undefined && !["demo","real"].includes(String(body.mode))) throw new ApiError(403, "INVALID_MODE", "Modo inválido.");
    if(body.action==='snapshot'||body.action==='social_snapshot')return jsonResponse(await executeGameAction(user.id,body),200,headers);
    if (!pendingActions.has(body.action)) throw new ApiError(400, "UNKNOWN_ACTION", "Ação desconhecida.");
    if (body.action.startsWith("admin_")) await requireAdmin(user.id);
    if(body.action==='admin_delete'){if(!['robot','part'].includes(String(body.kind))||typeof body.id!=='string')throw new ApiError(400,'INVALID_CONTENT','Conteúdo inválido.');const deleted=await serverClient().rpc('lr_admin_delete_content',{p_actor:user.id,p_kind:body.kind,p_id:body.id});if(deleted.error)throw new ApiError(400,'CONTENT_IN_USE','Troque as referências da campanha e da arena; itens já adquiridos devem permanecer no catálogo.');return jsonResponse({ok:true},200,headers);}
    if(body.action==='admin_payments_policy'){if(typeof body.enabled!=='boolean')throw new ApiError(400,'INVALID_POLICY','Informe a política.');const saved=await serverClient().rpc('lr_admin_set_payments',{p_actor:user.id,p_enabled:body.enabled});if(saved.error)throw new ApiError(400,'POLICY_SAVE_FAILED','Não foi possível salvar.');return jsonResponse({ok:true},200,headers);}
    if(body.action==='admin_save'){
      const client=serverClient(),current=await client.rpc('lr_snapshot',{p_user_id:user.id});
      if(current.error||!current.data)throw new ApiError(503,'BACKEND_NOT_READY','Não foi possível carregar o universo.');
      const content=validatedContent(body,current.data);
      const saved=await client.rpc('lr_admin_save_content',{p_actor:user.id,p_kind:content.kind,p_value:content.value});
      if(saved.error)throw new ApiError(400,'CONTENT_SAVE_FAILED','Não foi possível salvar. Verifique os campos e arquivos em uso.');
      return jsonResponse({ok:true},200,headers);
    }
    if(['deposit','withdraw','payment_status','admin_review_withdrawal'].includes(body.action))return jsonResponse(await paymentAction(user.id,body),200,headers);
    if(body.action==='admin_publish_notice'){const current=await executeGameAction(user.id,{action:'snapshot'}),validated=validatedContent({settings:body.notice},current.data);const saved=await serverClient().rpc('lr_admin_save_content',{p_actor:user.id,p_kind:validated.kind,p_value:validated.value});if(saved.error)throw new ApiError(400,'NOTICE_FAILED','Não foi possível publicar.');return jsonResponse({ok:true},200,headers);}
    return jsonResponse(await executeGameAction(user.id,body),200,headers);
  } catch (error) { return errorResponse(error, headers); }
});
