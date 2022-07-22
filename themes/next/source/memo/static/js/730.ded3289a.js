"use strict";(self["webpackChunkcopy_todo"]=self["webpackChunkcopy_todo"]||[]).push([[730],{368:function(){},6742:function(){},2939:function(){},1958:function(){},1730:function(e,t,l){l.r(t),l.d(t,{default:function(){return K}});var n=l(1404),a=(l(6699),l(3396)),r=l(4870),i=l(610),o=l(5323),s=l(2220),c=l(5322),u=l(6491),d=l(8332),f=l(7936);function g(e){return Array.isArray(e)?!e.length:0!==e&&!e}function m(e,t){return(!t.required||!g(e))&&!(t.pattern&&!t.pattern.test(String(e)))}function p(e,t){return new Promise((l=>{const n=t.validator(e,t);(0,u.tI)(n)?n.then(l):l(n)}))}function v(e,t){const{message:l}=t;return(0,u.mf)(l)?l(e,t):l||""}function h({target:e}){e.composing=!0}function b({target:e}){e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}function y(e,t){const l=(0,f.oD)();e.style.height="auto";let n=e.scrollHeight;if((0,u.Kn)(t)){const{maxHeight:e,minHeight:l}=t;void 0!==e&&(n=Math.min(n,e)),void 0!==l&&(n=Math.max(n,l))}n&&(e.style.height=`${n}px`,(0,f.kn)(l))}function k(e){return"number"===e?{type:"text",inputmode:"decimal"}:"digit"===e?{type:"tel",inputmode:"numeric"}:{type:e}}function x(e){return[...e].length}function W(e,t){return[...e].slice(0,t).join("")}var w=l(6014),C=l(316);const[S,T]=(0,i["do"])("cell"),V={icon:String,size:String,title:o.Or,value:o.Or,label:o.Or,center:Boolean,isLink:Boolean,border:o.J5,required:Boolean,iconPrefix:String,valueClass:o.Vg,labelClass:o.Vg,titleClass:o.Vg,titleStyle:null,arrowDirection:String,clickable:{type:Boolean,default:null}},B=(0,s.l7)({},V,w.g2);var I=(0,a.aZ)({name:S,props:B,setup(e,{slots:t}){const l=(0,w.yj)(),n=()=>{const l=t.label||(0,u.Xq)(e.label);if(l)return(0,a.Wm)("div",{class:[T("label"),e.labelClass]},[t.label?t.label():e.label])},r=()=>{if(t.title||(0,u.Xq)(e.title))return(0,a.Wm)("div",{class:[T("title"),e.titleClass],style:e.titleStyle},[t.title?t.title():(0,a.Wm)("span",null,[e.title]),n()])},i=()=>{const l=t.value||t.default,n=l||(0,u.Xq)(e.value);if(n){const n=t.title||(0,u.Xq)(e.title);return(0,a.Wm)("div",{class:[T("value",{alone:!n}),e.valueClass]},[l?l():(0,a.Wm)("span",null,[e.value])])}},o=()=>t.icon?t.icon():e.icon?(0,a.Wm)(C.J,{name:e.icon,class:T("left-icon"),classPrefix:e.iconPrefix},null):void 0,s=()=>{if(t["right-icon"])return t["right-icon"]();if(e.isLink){const t=e.arrowDirection?`arrow-${e.arrowDirection}`:"arrow";return(0,a.Wm)(C.J,{name:t,class:T("right-icon")},null)}};return()=>{var n,c;const{size:u,center:d,border:f,isLink:g,required:m}=e,p=null!=(n=e.clickable)?n:g,v={center:d,required:m,clickable:p,borderless:!f};return u&&(v[u]=!!u),(0,a.Wm)("div",{class:T(v),role:p?"button":void 0,tabindex:p?0:void 0,onClick:l},[o(),r(),i(),s(),null==(c=t.extra)?void 0:c.call(t)])}}}),q=l(253);let F=0;function A(){const e=(0,a.FN)(),{name:t="unknown"}=(null==e?void 0:e.type)||{};return`${t}-${++F}`}var L=l(3444);const M=(0,n.n)(I);const[P,z]=(0,i["do"])("field"),J={id:String,name:String,leftIcon:String,rightIcon:String,autofocus:Boolean,clearable:Boolean,maxlength:o.Or,formatter:Function,clearIcon:(0,o.SQ)("clear"),modelValue:(0,o.SI)(""),inputAlign:String,placeholder:String,autocomplete:String,errorMessage:String,enterkeyhint:String,clearTrigger:(0,o.SQ)("focus"),formatTrigger:(0,o.SQ)("onChange"),error:{type:Boolean,default:null},disabled:{type:Boolean,default:null},readonly:{type:Boolean,default:null}},O=(0,s.l7)({},V,J,{rows:o.Or,type:(0,o.SQ)("text"),rules:Array,autosize:[Boolean,Object],labelWidth:o.Or,labelClass:o.Vg,labelAlign:String,showWordLimit:Boolean,errorMessageAlign:String,colon:{type:Boolean,default:null}});var $=(0,a.aZ)({name:P,props:O,emits:["blur","focus","clear","keypress","click-input","end-validate","start-validate","click-left-icon","click-right-icon","update:modelValue"],setup(e,{emit:t,slots:l}){const n=A(),i=(0,r.qj)({status:"unvalidated",focused:!1,validateMessage:""}),o=(0,r.iH)(),g=(0,r.iH)(),{parent:w}=(0,q.NB)(c.WN),S=()=>{var t;return String(null!=(t=e.modelValue)?t:"")},T=t=>(0,u.Xq)(e[t])?e[t]:w&&(0,u.Xq)(w.props[t])?w.props[t]:void 0,V=(0,a.Fl)((()=>{const t=T("readonly");if(e.clearable&&!t){const t=""!==S(),l="always"===e.clearTrigger||"focus"===e.clearTrigger&&i.focused;return t&&l}return!1})),B=(0,a.Fl)((()=>g.value&&l.input?g.value():e.modelValue)),I=e=>e.reduce(((e,t)=>e.then((()=>{if("failed"===i.status)return;let{value:e}=B;return t.formatter&&(e=t.formatter(e,t)),m(e,t)?t.validator?p(e,t).then((l=>{l&&"string"===typeof l?(i.status="failed",i.validateMessage=l):!1===l&&(i.status="failed",i.validateMessage=v(e,t))})):void 0:(i.status="failed",void(i.validateMessage=v(e,t)))}))),Promise.resolve()),F=()=>{i.status="unvalidated",i.validateMessage=""},P=()=>t("end-validate",{status:i.status}),J=(l=e.rules)=>new Promise((n=>{F(),l?(t("start-validate"),I(l).then((()=>{"failed"===i.status?(n({name:e.name,message:i.validateMessage}),P()):(i.status="passed",n(),P())}))):n()})),O=t=>{if(w&&e.rules){const{validateTrigger:l}=w.props,n=(0,s.qo)(l).includes(t),a=e.rules.filter((e=>e.trigger?(0,s.qo)(e.trigger).includes(t):n));a.length&&J(a)}},$=t=>{const{maxlength:l}=e;if((0,u.Xq)(l)&&x(t)>l){const e=S();return e&&x(e)===+l?e:W(t,+l)}return t},D=(l,n="onChange")=>{if(l=$(l),"number"===e.type||"digit"===e.type){const t="number"===e.type;l=(0,d.uf)(l,t,t)}e.formatter&&n===e.formatTrigger&&(l=e.formatter(l)),o.value&&o.value.value!==l&&(o.value.value=l),l!==e.modelValue&&t("update:modelValue",l)},j=e=>{e.target.composing||D(e.target.value)},H=()=>{var e;return null==(e=o.value)?void 0:e.blur()},X=()=>{var e;return null==(e=o.value)?void 0:e.focus()},E=()=>{const t=o.value;"textarea"===e.type&&e.autosize&&t&&y(t,e.autosize)},Y=e=>{i.focused=!0,t("focus",e),(0,a.Y3)(E),T("readonly")&&H()},N=e=>{T("readonly")||(i.focused=!1,D(S(),"onBlur"),t("blur",e),O("onBlur"),(0,a.Y3)(E),(0,f.pe)())},R=e=>t("click-input",e),Z=e=>t("click-left-icon",e),_=e=>t("click-right-icon",e),Q=e=>{(0,f.PF)(e),t("update:modelValue",""),t("clear",e)},K=(0,a.Fl)((()=>"boolean"===typeof e.error?e.error:!(!w||!w.props.showError||"failed"!==i.status)||void 0)),U=(0,a.Fl)((()=>{const e=T("labelWidth");if(e)return{width:(0,d.Nn)(e)}})),G=l=>{const n=13;if(l.keyCode===n){const t=w&&w.props.submitOnEnter;t||"textarea"===e.type||(0,f.PF)(l),"search"===e.type&&H()}t("keypress",l)},ee=()=>e.id||`${n}-input`,te=()=>i.status,le=()=>{const t=z("control",[T("inputAlign"),{error:K.value,custom:!!l.input,"min-height":"textarea"===e.type&&!e.autosize}]);if(l.input)return(0,a.Wm)("div",{class:t,onClick:R},[l.input()]);const r={id:ee(),ref:o,name:e.name,rows:void 0!==e.rows?+e.rows:void 0,class:t,disabled:T("disabled"),readonly:T("readonly"),autofocus:e.autofocus,placeholder:e.placeholder,autocomplete:e.autocomplete,enterkeyhint:e.enterkeyhint,"aria-labelledby":e.label?`${n}-label`:void 0,onBlur:N,onFocus:Y,onInput:j,onClick:R,onChange:b,onKeypress:G,onCompositionend:b,onCompositionstart:h};return"textarea"===e.type?(0,a.Wm)("textarea",r,null):(0,a.Wm)("input",(0,a.dG)(k(e.type),r),null)},ne=()=>{const t=l["left-icon"];if(e.leftIcon||t)return(0,a.Wm)("div",{class:z("left-icon"),onClick:Z},[t?t():(0,a.Wm)(C.J,{name:e.leftIcon,classPrefix:e.iconPrefix},null)])},ae=()=>{const t=l["right-icon"];if(e.rightIcon||t)return(0,a.Wm)("div",{class:z("right-icon"),onClick:_},[t?t():(0,a.Wm)(C.J,{name:e.rightIcon,classPrefix:e.iconPrefix},null)])},re=()=>{if(e.showWordLimit&&e.maxlength){const t=x(S());return(0,a.Wm)("div",{class:z("word-limit")},[(0,a.Wm)("span",{class:z("word-num")},[t]),(0,a.Uk)("/"),e.maxlength])}},ie=()=>{if(w&&!1===w.props.showErrorMessage)return;const t=e.errorMessage||i.validateMessage;if(t){const e=l["error-message"],n=T("errorMessageAlign");return(0,a.Wm)("div",{class:z("error-message",n)},[e?e({message:t}):t])}},oe=()=>{const t=T("colon")?":":"";return l.label?[l.label(),t]:e.label?(0,a.Wm)("label",{id:`${n}-label`,for:ee()},[e.label+t]):void 0},se=()=>[(0,a.Wm)("div",{class:z("body")},[le(),V.value&&(0,a.Wm)(C.J,{name:e.clearIcon,class:z("clear"),onTouchstart:Q},null),ae(),l.button&&(0,a.Wm)("div",{class:z("button")},[l.button()])]),re(),ie()];return(0,L.F)({blur:H,focus:X,validate:J,formValue:B,resetValidation:F,getValidationStatus:te}),(0,a.JJ)(q.F1,{customValue:g,resetValidation:F,validateWithTrigger:O}),(0,a.YP)((()=>e.modelValue),(()=>{D(S()),F(),O("onChange"),(0,a.Y3)(E)})),(0,a.bv)((()=>{D(S(),e.formatTrigger),(0,a.Y3)(E)})),()=>{const t=T("disabled"),n=T("labelAlign"),r=oe(),i=ne();return(0,a.Wm)(M,{size:e.size,icon:e.leftIcon,class:z({error:K.value,disabled:t,[`label-${n}`]:n}),center:e.center,border:e.border,isLink:e.isLink,clickable:e.clickable,titleStyle:U.value,valueClass:z("value"),titleClass:[z("label",[n,{required:e.required}]),e.labelClass],arrowDirection:e.arrowDirection},{icon:i?()=>i:null,title:r?()=>r:null,value:se,extra:l.extra})}}});const D=(0,n.n)($);l(1958),l(368),l(6742);var j=l(440);l(2097);const H={class:"page-detail"},X={class:"scroll-area"};function E(e,t,l,n,r,i){const o=j.l,s=D;return(0,a.wg)(),(0,a.iD)("div",H,[(0,a.Wm)(o,{"left-arrow":"","right-text":"保存",title:e.pageTitle,onClickLeft:e.onClickLeft,onClickRight:e.onClickRight},null,8,["title","onClickLeft","onClickRight"]),(0,a._)("div",X,[(0,a.Wm)(s,{"label-width":e.labelWidth,modelValue:e.title,"onUpdate:modelValue":t[0]||(t[0]=t=>e.title=t),label:"标题",placeholder:"请输入标题"},null,8,["label-width","modelValue"]),(0,a.Wm)(s,{"label-width":e.labelWidth,modelValue:e.detail,"onUpdate:modelValue":t[1]||(t[1]=t=>e.detail=t),label:"内容",placeholder:"请输入内容",type:"textarea",autosize:""},null,8,["label-width","modelValue"])])])}var Y=l(3747),N=l(2483),R=l(65),Z=(l(9423),(0,a.aZ)({components:{[j.l.name]:j.l,[D.name]:D},name:"PageDetail",setup(){const e=(0,N.tv)(),t=(0,N.yj)(),l=(0,R.oR)(),{type:n,id:i}=t.query,o="3em",s=(0,r.qj)({title:"",detail:"",id:(new Date).getTime()});if("detail"===n&&i){const e=l.state.todoList.find((e=>e.id==i));s.title=e.title,s.detail=e.detail,s.id=e.id}const c=(0,a.Fl)((()=>{if("create"===n)return"新增笔记";if("detail"===n){const e=l.state.todoList.find((e=>e.id==i));return e.title}return""})),u=()=>{e.back()},d=()=>{s.title&&s.detail?"create"===n?(l.commit("addTodoItem",s),Y.F.success("保存成功"),e.back()):"detail"===n&&i&&(l.commit("saveTodoItem",s),Y.F.success("保存成功"),e.back()):(0,Y.F)("请填写标题或内容")};return{...(0,r.BK)(s),pageTitle:c,labelWidth:o,onClickLeft:u,onClickRight:d}}})),_=l(89);const Q=(0,_.Z)(Z,[["render",E],["__scopeId","data-v-6cb3b62b"]]);var K=Q},6014:function(e,t,l){l.d(t,{g2:function(){return a},yj:function(){return i}});var n=l(3396);const a={to:[String,Object],url:String,replace:Boolean};function r({to:e,url:t,replace:l,$router:n}){e&&n?n[l?"replace":"push"](e):t&&(l?location.replace(t):location.href=t)}function i(){const e=(0,n.FN)().proxy;return()=>r(e)}},440:function(e,t,l){l.d(t,{l:function(){return b}});var n=l(1404),a=l(3396),r=l(4870),i=l(610),o=l(5323),s=l(8332),c=l(5322),u=l(253);const d=e=>{const t=(0,r.iH)(),l=()=>{t.value=(0,u.EL)(e).height};return(0,a.bv)((()=>{(0,a.Y3)(l),setTimeout(l,100)})),t};function f(e,t){const l=d(e);return e=>(0,a.Wm)("div",{class:t("placeholder"),style:{height:l.value?`${l.value}px`:void 0}},[e()])}var g=l(316);const[m,p]=(0,i["do"])("nav-bar"),v={title:String,fixed:Boolean,zIndex:o.Or,border:o.J5,leftText:String,rightText:String,leftArrow:Boolean,placeholder:Boolean,safeAreaInsetTop:Boolean};var h=(0,a.aZ)({name:m,props:v,emits:["click-left","click-right"],setup(e,{emit:t,slots:l}){const n=(0,r.iH)(),i=f(n,p),o=e=>t("click-left",e),u=e=>t("click-right",e),d=()=>l.left?l.left():[e.leftArrow&&(0,a.Wm)(g.J,{class:p("arrow"),name:"arrow-left"},null),e.leftText&&(0,a.Wm)("span",{class:p("text")},[e.leftText])],m=()=>l.right?l.right():(0,a.Wm)("span",{class:p("text")},[e.rightText]),v=()=>{const{title:t,fixed:r,border:i,zIndex:f}=e,g=(0,s.As)(f),v=e.leftArrow||e.leftText||l.left,h=e.rightText||l.right;return(0,a.Wm)("div",{ref:n,style:g,class:[p({fixed:r}),{[c.xe]:i,"van-safe-area-top":e.safeAreaInsetTop}]},[(0,a.Wm)("div",{class:p("content")},[v&&(0,a.Wm)("div",{class:[p("left"),c.e9],onClick:o},[d()]),(0,a.Wm)("div",{class:[p("title"),"van-ellipsis"]},[l.title?l.title():t]),h&&(0,a.Wm)("div",{class:[p("right"),c.e9],onClick:u},[m()])])])};return()=>e.fixed&&e.placeholder?i(v):v()}});const b=(0,n.n)(h)},2097:function(e,t,l){l(1958),l(368),l(6742)},9423:function(e,t,l){l(1958),l(368),l(6742),l(2939)}}]);