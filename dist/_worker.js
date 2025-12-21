var Ir=Object.defineProperty;var We=e=>{throw TypeError(e)};var Sr=(e,r,t)=>r in e?Ir(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t;var E=(e,r,t)=>Sr(e,typeof r!="symbol"?r+"":r,t),Fe=(e,r,t)=>r.has(e)||We("Cannot "+t);var l=(e,r,t)=>(Fe(e,r,"read from private field"),t?t.call(e):r.get(e)),w=(e,r,t)=>r.has(e)?We("Cannot add the same private member more than once"):r instanceof WeakSet?r.add(e):r.set(e,t),g=(e,r,t,s)=>(Fe(e,r,"write to private field"),s?s.call(e,t):r.set(e,t),t),v=(e,r,t)=>(Fe(e,r,"access private method"),t);var Ve=(e,r,t,s)=>({set _(n){g(e,r,n,t)},get _(){return l(e,r,s)}});var Ye=(e,r,t)=>(s,n)=>{let a=-1;return o(0);async function o(i){if(i<=a)throw new Error("next() called multiple times");a=i;let c,d=!1,u;if(e[i]?(u=e[i][0][0],s.req.routeIndex=i):u=i===e.length&&n||void 0,u)try{c=await u(s,()=>o(i+1))}catch(p){if(p instanceof Error&&r)s.error=p,c=await r(p,s),d=!0;else throw p}else s.finalized===!1&&t&&(c=await t(s));return c&&(s.finalized===!1||d)&&(s.res=c),s}},Dr=Symbol(),jr=async(e,r=Object.create(null))=>{const{all:t=!1,dot:s=!1}=r,a=(e instanceof cr?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?Ar(e,{all:t,dot:s}):{}};async function Ar(e,r){const t=await e.formData();return t?Or(t,r):{}}function Or(e,r){const t=Object.create(null);return e.forEach((s,n)=>{r.all||n.endsWith("[]")?kr(t,n,s):t[n]=s}),r.dot&&Object.entries(t).forEach(([s,n])=>{s.includes(".")&&(Cr(t,s,n),delete t[s])}),t}var kr=(e,r,t)=>{e[r]!==void 0?Array.isArray(e[r])?e[r].push(t):e[r]=[e[r],t]:r.endsWith("[]")?e[r]=[t]:e[r]=t},Cr=(e,r,t)=>{let s=e;const n=r.split(".");n.forEach((a,o)=>{o===n.length-1?s[a]=t:((!s[a]||typeof s[a]!="object"||Array.isArray(s[a])||s[a]instanceof File)&&(s[a]=Object.create(null)),s=s[a])})},sr=e=>{const r=e.split("/");return r[0]===""&&r.shift(),r},Nr=e=>{const{groups:r,path:t}=xr(e),s=sr(t);return Ur(s,r)},xr=e=>{const r=[];return e=e.replace(/\{[^}]+\}/g,(t,s)=>{const n=`@${s}`;return r.push([n,t]),n}),{groups:r,path:e}},Ur=(e,r)=>{for(let t=r.length-1;t>=0;t--){const[s]=r[t];for(let n=e.length-1;n>=0;n--)if(e[n].includes(s)){e[n]=e[n].replace(s,r[t][1]);break}}return e},Oe={},Lr=(e,r)=>{if(e==="*")return"*";const t=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(t){const s=`${e}#${r}`;return Oe[s]||(t[2]?Oe[s]=r&&r[0]!==":"&&r[0]!=="*"?[s,t[1],new RegExp(`^${t[2]}(?=/${r})`)]:[e,t[1],new RegExp(`^${t[2]}$`)]:Oe[s]=[e,t[1],!0]),Oe[s]}return null},$e=(e,r)=>{try{return r(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,t=>{try{return r(t)}catch{return t}})}},Pr=e=>$e(e,decodeURI),nr=e=>{const r=e.url,t=r.indexOf("/",r.indexOf(":")+4);let s=t;for(;s<r.length;s++){const n=r.charCodeAt(s);if(n===37){const a=r.indexOf("?",s),o=r.slice(t,a===-1?void 0:a);return Pr(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return r.slice(t,s)},Fr=e=>{const r=nr(e);return r.length>1&&r.at(-1)==="/"?r.slice(0,-1):r},le=(e,r,...t)=>(t.length&&(r=le(r,...t)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${r==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(r==null?void 0:r[0])==="/"?r.slice(1):r}`}`),ar=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const r=e.split("/"),t=[];let s="";return r.forEach(n=>{if(n!==""&&!/\:/.test(n))s+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){t.length===0&&s===""?t.push("/"):t.push(s);const a=n.replace("?","");s+="/"+a,t.push(s)}else s+="/"+n}),t.filter((n,a,o)=>o.indexOf(n)===a)},Be=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?$e(e,ir):e):e,or=(e,r,t)=>{let s;if(!t&&r&&!/[%+]/.test(r)){let o=e.indexOf("?",8);if(o===-1)return;for(e.startsWith(r,o+1)||(o=e.indexOf(`&${r}`,o+1));o!==-1;){const i=e.charCodeAt(o+r.length+1);if(i===61){const c=o+r.length+2,d=e.indexOf("&",c);return Be(e.slice(c,d===-1?void 0:d))}else if(i==38||isNaN(i))return"";o=e.indexOf(`&${r}`,o+1)}if(s=/[%+]/.test(e),!s)return}const n={};s??(s=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const o=e.indexOf("&",a+1);let i=e.indexOf("=",a);i>o&&o!==-1&&(i=-1);let c=e.slice(a+1,i===-1?o===-1?void 0:o:i);if(s&&(c=Be(c)),a=o,c==="")continue;let d;i===-1?d="":(d=e.slice(i+1,o===-1?void 0:o),s&&(d=Be(d))),t?(n[c]&&Array.isArray(n[c])||(n[c]=[]),n[c].push(d)):n[c]??(n[c]=d)}return r?n[r]:n},Br=or,Mr=(e,r)=>or(e,r,!0),ir=decodeURIComponent,Ge=e=>$e(e,ir),fe,P,Y,dr,ur,He,G,Xe,cr=(Xe=class{constructor(e,r="/",t=[[]]){w(this,Y);E(this,"raw");w(this,fe);w(this,P);E(this,"routeIndex",0);E(this,"path");E(this,"bodyCache",{});w(this,G,e=>{const{bodyCache:r,raw:t}=this,s=r[e];if(s)return s;const n=Object.keys(r)[0];return n?r[n].then(a=>(n==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):r[e]=t[e]()});this.raw=e,this.path=r,g(this,P,t),g(this,fe,{})}param(e){return e?v(this,Y,dr).call(this,e):v(this,Y,ur).call(this)}query(e){return Br(this.url,e)}queries(e){return Mr(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const r={};return this.raw.headers.forEach((t,s)=>{r[s]=t}),r}async parseBody(e){var r;return(r=this.bodyCache).parsedBody??(r.parsedBody=await jr(this,e))}json(){return l(this,G).call(this,"text").then(e=>JSON.parse(e))}text(){return l(this,G).call(this,"text")}arrayBuffer(){return l(this,G).call(this,"arrayBuffer")}blob(){return l(this,G).call(this,"blob")}formData(){return l(this,G).call(this,"formData")}addValidatedData(e,r){l(this,fe)[e]=r}valid(e){return l(this,fe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Dr](){return l(this,P)}get matchedRoutes(){return l(this,P)[0].map(([[,e]])=>e)}get routePath(){return l(this,P)[0].map(([[,e]])=>e)[this.routeIndex].path}},fe=new WeakMap,P=new WeakMap,Y=new WeakSet,dr=function(e){const r=l(this,P)[0][this.routeIndex][1][e],t=v(this,Y,He).call(this,r);return t&&/\%/.test(t)?Ge(t):t},ur=function(){const e={},r=Object.keys(l(this,P)[0][this.routeIndex][1]);for(const t of r){const s=v(this,Y,He).call(this,l(this,P)[0][this.routeIndex][1][t]);s!==void 0&&(e[t]=/\%/.test(s)?Ge(s):s)}return e},He=function(e){return l(this,P)[1]?l(this,P)[1][e]:e},G=new WeakMap,Xe),Hr={Stringify:1},lr=async(e,r,t,s,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(n?n[0]+=e:n=[e],Promise.all(a.map(i=>i({phase:r,buffer:n,context:s}))).then(i=>Promise.all(i.filter(Boolean).map(c=>lr(c,r,!1,s,n))).then(()=>n[0]))):Promise.resolve(e)},qr="text/plain; charset=UTF-8",Me=(e,r)=>({"Content-Type":e,...r}),Te,Ie,q,he,$,C,Se,ge,Ee,se,De,je,K,pe,Qe,$r=(Qe=class{constructor(e,r){w(this,K);w(this,Te);w(this,Ie);E(this,"env",{});w(this,q);E(this,"finalized",!1);E(this,"error");w(this,he);w(this,$);w(this,C);w(this,Se);w(this,ge);w(this,Ee);w(this,se);w(this,De);w(this,je);E(this,"render",(...e)=>(l(this,ge)??g(this,ge,r=>this.html(r)),l(this,ge).call(this,...e)));E(this,"setLayout",e=>g(this,Se,e));E(this,"getLayout",()=>l(this,Se));E(this,"setRenderer",e=>{g(this,ge,e)});E(this,"header",(e,r,t)=>{this.finalized&&g(this,C,new Response(l(this,C).body,l(this,C)));const s=l(this,C)?l(this,C).headers:l(this,se)??g(this,se,new Headers);r===void 0?s.delete(e):t!=null&&t.append?s.append(e,r):s.set(e,r)});E(this,"status",e=>{g(this,he,e)});E(this,"set",(e,r)=>{l(this,q)??g(this,q,new Map),l(this,q).set(e,r)});E(this,"get",e=>l(this,q)?l(this,q).get(e):void 0);E(this,"newResponse",(...e)=>v(this,K,pe).call(this,...e));E(this,"body",(e,r,t)=>v(this,K,pe).call(this,e,r,t));E(this,"text",(e,r,t)=>!l(this,se)&&!l(this,he)&&!r&&!t&&!this.finalized?new Response(e):v(this,K,pe).call(this,e,r,Me(qr,t)));E(this,"json",(e,r,t)=>v(this,K,pe).call(this,JSON.stringify(e),r,Me("application/json",t)));E(this,"html",(e,r,t)=>{const s=n=>v(this,K,pe).call(this,n,r,Me("text/html; charset=UTF-8",t));return typeof e=="object"?lr(e,Hr.Stringify,!1,{}).then(s):s(e)});E(this,"redirect",(e,r)=>{const t=String(e);return this.header("Location",/[^\x00-\xFF]/.test(t)?encodeURI(t):t),this.newResponse(null,r??302)});E(this,"notFound",()=>(l(this,Ee)??g(this,Ee,()=>new Response),l(this,Ee).call(this,this)));g(this,Te,e),r&&(g(this,$,r.executionCtx),this.env=r.env,g(this,Ee,r.notFoundHandler),g(this,je,r.path),g(this,De,r.matchResult))}get req(){return l(this,Ie)??g(this,Ie,new cr(l(this,Te),l(this,je),l(this,De))),l(this,Ie)}get event(){if(l(this,$)&&"respondWith"in l(this,$))return l(this,$);throw Error("This context has no FetchEvent")}get executionCtx(){if(l(this,$))return l(this,$);throw Error("This context has no ExecutionContext")}get res(){return l(this,C)||g(this,C,new Response(null,{headers:l(this,se)??g(this,se,new Headers)}))}set res(e){if(l(this,C)&&e){e=new Response(e.body,e);for(const[r,t]of l(this,C).headers.entries())if(r!=="content-type")if(r==="set-cookie"){const s=l(this,C).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of s)e.headers.append("set-cookie",n)}else e.headers.set(r,t)}g(this,C,e),this.finalized=!0}get var(){return l(this,q)?Object.fromEntries(l(this,q)):{}}},Te=new WeakMap,Ie=new WeakMap,q=new WeakMap,he=new WeakMap,$=new WeakMap,C=new WeakMap,Se=new WeakMap,ge=new WeakMap,Ee=new WeakMap,se=new WeakMap,De=new WeakMap,je=new WeakMap,K=new WeakSet,pe=function(e,r,t){const s=l(this,C)?new Headers(l(this,C).headers):l(this,se)??new Headers;if(typeof r=="object"&&"headers"in r){const a=r.headers instanceof Headers?r.headers:new Headers(r.headers);for(const[o,i]of a)o.toLowerCase()==="set-cookie"?s.append(o,i):s.set(o,i)}if(t)for(const[a,o]of Object.entries(t))if(typeof o=="string")s.set(a,o);else{s.delete(a);for(const i of o)s.append(a,i)}const n=typeof r=="number"?r:(r==null?void 0:r.status)??l(this,he);return new Response(e,{status:n,headers:s})},Qe),I="ALL",Wr="all",Vr=["get","post","put","delete","options","patch"],pr="Can not add a route since the matcher is already built.",mr=class extends Error{},Yr="__COMPOSED_HANDLER",Gr=e=>e.text("404 Not Found",404),Ke=(e,r)=>{if("getResponse"in e){const t=e.getResponse();return r.newResponse(t.body,t)}return console.error(e),r.text("Internal Server Error",500)},F,S,fr,B,re,ke,Ce,_e,Kr=(_e=class{constructor(r={}){w(this,S);E(this,"get");E(this,"post");E(this,"put");E(this,"delete");E(this,"options");E(this,"patch");E(this,"all");E(this,"on");E(this,"use");E(this,"router");E(this,"getPath");E(this,"_basePath","/");w(this,F,"/");E(this,"routes",[]);w(this,B,Gr);E(this,"errorHandler",Ke);E(this,"onError",r=>(this.errorHandler=r,this));E(this,"notFound",r=>(g(this,B,r),this));E(this,"fetch",(r,...t)=>v(this,S,Ce).call(this,r,t[1],t[0],r.method));E(this,"request",(r,t,s,n)=>r instanceof Request?this.fetch(t?new Request(r,t):r,s,n):(r=r.toString(),this.fetch(new Request(/^https?:\/\//.test(r)?r:`http://localhost${le("/",r)}`,t),s,n)));E(this,"fire",()=>{addEventListener("fetch",r=>{r.respondWith(v(this,S,Ce).call(this,r.request,r,void 0,r.request.method))})});[...Vr,Wr].forEach(a=>{this[a]=(o,...i)=>(typeof o=="string"?g(this,F,o):v(this,S,re).call(this,a,l(this,F),o),i.forEach(c=>{v(this,S,re).call(this,a,l(this,F),c)}),this)}),this.on=(a,o,...i)=>{for(const c of[o].flat()){g(this,F,c);for(const d of[a].flat())i.map(u=>{v(this,S,re).call(this,d.toUpperCase(),l(this,F),u)})}return this},this.use=(a,...o)=>(typeof a=="string"?g(this,F,a):(g(this,F,"*"),o.unshift(a)),o.forEach(i=>{v(this,S,re).call(this,I,l(this,F),i)}),this);const{strict:s,...n}=r;Object.assign(this,n),this.getPath=s??!0?r.getPath??nr:Fr}route(r,t){const s=this.basePath(r);return t.routes.map(n=>{var o;let a;t.errorHandler===Ke?a=n.handler:(a=async(i,c)=>(await Ye([],t.errorHandler)(i,()=>n.handler(i,c))).res,a[Yr]=n.handler),v(o=s,S,re).call(o,n.method,n.path,a)}),this}basePath(r){const t=v(this,S,fr).call(this);return t._basePath=le(this._basePath,r),t}mount(r,t,s){let n,a;s&&(typeof s=="function"?a=s:(a=s.optionHandler,s.replaceRequest===!1?n=c=>c:n=s.replaceRequest));const o=a?c=>{const d=a(c);return Array.isArray(d)?d:[d]}:c=>{let d;try{d=c.executionCtx}catch{}return[c.env,d]};n||(n=(()=>{const c=le(this._basePath,r),d=c==="/"?0:c.length;return u=>{const p=new URL(u.url);return p.pathname=p.pathname.slice(d)||"/",new Request(p,u)}})());const i=async(c,d)=>{const u=await t(n(c.req.raw),...o(c));if(u)return u;await d()};return v(this,S,re).call(this,I,le(r,"*"),i),this}},F=new WeakMap,S=new WeakSet,fr=function(){const r=new _e({router:this.router,getPath:this.getPath});return r.errorHandler=this.errorHandler,g(r,B,l(this,B)),r.routes=this.routes,r},B=new WeakMap,re=function(r,t,s){r=r.toUpperCase(),t=le(this._basePath,t);const n={basePath:this._basePath,path:t,method:r,handler:s};this.router.add(r,t,[s,n]),this.routes.push(n)},ke=function(r,t){if(r instanceof Error)return this.errorHandler(r,t);throw r},Ce=function(r,t,s,n){if(n==="HEAD")return(async()=>new Response(null,await v(this,S,Ce).call(this,r,t,s,"GET")))();const a=this.getPath(r,{env:s}),o=this.router.match(n,a),i=new $r(r,{path:a,matchResult:o,env:s,executionCtx:t,notFoundHandler:l(this,B)});if(o[0].length===1){let d;try{d=o[0][0][0][0](i,async()=>{i.res=await l(this,B).call(this,i)})}catch(u){return v(this,S,ke).call(this,u,i)}return d instanceof Promise?d.then(u=>u||(i.finalized?i.res:l(this,B).call(this,i))).catch(u=>v(this,S,ke).call(this,u,i)):d??l(this,B).call(this,i)}const c=Ye(o[0],this.errorHandler,l(this,B));return(async()=>{try{const d=await c(i);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return v(this,S,ke).call(this,d,i)}})()},_e),hr=[];function Jr(e,r){const t=this.buildAllMatchers(),s=((n,a)=>{const o=t[n]||t[I],i=o[2][a];if(i)return i;const c=a.match(o[0]);if(!c)return[[],hr];const d=c.indexOf("",1);return[o[1][d],c]});return this.match=s,s(e,r)}var xe="[^/]+",ve=".*",Re="(?:|/.*)",me=Symbol(),zr=new Set(".\\+*[^]$()");function Xr(e,r){return e.length===1?r.length===1?e<r?-1:1:-1:r.length===1||e===ve||e===Re?1:r===ve||r===Re?-1:e===xe?1:r===xe?-1:e.length===r.length?e<r?-1:1:r.length-e.length}var ne,ae,M,ce,Qr=(ce=class{constructor(){w(this,ne);w(this,ae);w(this,M,Object.create(null))}insert(r,t,s,n,a){if(r.length===0){if(l(this,ne)!==void 0)throw me;if(a)return;g(this,ne,t);return}const[o,...i]=r,c=o==="*"?i.length===0?["","",ve]:["","",xe]:o==="/*"?["","",Re]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(c){const u=c[1];let p=c[2]||xe;if(u&&c[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw me;if(d=l(this,M)[p],!d){if(Object.keys(l(this,M)).some(m=>m!==ve&&m!==Re))throw me;if(a)return;d=l(this,M)[p]=new ce,u!==""&&g(d,ae,n.varIndex++)}!a&&u!==""&&s.push([u,l(d,ae)])}else if(d=l(this,M)[o],!d){if(Object.keys(l(this,M)).some(u=>u.length>1&&u!==ve&&u!==Re))throw me;if(a)return;d=l(this,M)[o]=new ce}d.insert(i,t,s,n,a)}buildRegExpStr(){const t=Object.keys(l(this,M)).sort(Xr).map(s=>{const n=l(this,M)[s];return(typeof l(n,ae)=="number"?`(${s})@${l(n,ae)}`:zr.has(s)?`\\${s}`:s)+n.buildRegExpStr()});return typeof l(this,ne)=="number"&&t.unshift(`#${l(this,ne)}`),t.length===0?"":t.length===1?t[0]:"(?:"+t.join("|")+")"}},ne=new WeakMap,ae=new WeakMap,M=new WeakMap,ce),Ue,Ae,Ze,Zr=(Ze=class{constructor(){w(this,Ue,{varIndex:0});w(this,Ae,new Qr)}insert(e,r,t){const s=[],n=[];for(let o=0;;){let i=!1;if(e=e.replace(/\{[^}]+\}/g,c=>{const d=`@\\${o}`;return n[o]=[d,c],o++,i=!0,d}),!i)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[i]=n[o];for(let c=a.length-1;c>=0;c--)if(a[c].indexOf(i)!==-1){a[c]=a[c].replace(i,n[o][1]);break}}return l(this,Ae).insert(a,r,s,l(this,Ue),t),s}buildRegExp(){let e=l(this,Ae).buildRegExpStr();if(e==="")return[/^$/,[],[]];let r=0;const t=[],s=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,a,o)=>a!==void 0?(t[++r]=Number(a),"$()"):(o!==void 0&&(s[Number(o)]=++r),"")),[new RegExp(`^${e}`),t,s]}},Ue=new WeakMap,Ae=new WeakMap,Ze),et=[/^$/,[],Object.create(null)],Ne=Object.create(null);function gr(e){return Ne[e]??(Ne[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(r,t)=>t?`\\${t}`:"(?:|/.*)")}$`))}function rt(){Ne=Object.create(null)}function tt(e){var d;const r=new Zr,t=[];if(e.length===0)return et;const s=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,p],[m,h])=>u?1:m?-1:p.length-h.length),n=Object.create(null);for(let u=0,p=-1,m=s.length;u<m;u++){const[h,b,y]=s[u];h?n[b]=[y.map(([R])=>[R,Object.create(null)]),hr]:p++;let _;try{_=r.insert(b,p,h)}catch(R){throw R===me?new mr(b):R}h||(t[p]=y.map(([R,k])=>{const D=Object.create(null);for(k-=1;k>=0;k--){const[x,T]=_[k];D[x]=T}return[R,D]}))}const[a,o,i]=r.buildRegExp();for(let u=0,p=t.length;u<p;u++)for(let m=0,h=t[u].length;m<h;m++){const b=(d=t[u][m])==null?void 0:d[1];if(!b)continue;const y=Object.keys(b);for(let _=0,R=y.length;_<R;_++)b[y[_]]=i[b[y[_]]]}const c=[];for(const u in o)c[u]=t[o[u]];return[a,c,n]}function ue(e,r){if(e){for(const t of Object.keys(e).sort((s,n)=>n.length-s.length))if(gr(t).test(r))return[...e[t]]}}var J,z,Le,Er,er,st=(er=class{constructor(){w(this,Le);E(this,"name","RegExpRouter");w(this,J);w(this,z);E(this,"match",Jr);g(this,J,{[I]:Object.create(null)}),g(this,z,{[I]:Object.create(null)})}add(e,r,t){var i;const s=l(this,J),n=l(this,z);if(!s||!n)throw new Error(pr);s[e]||[s,n].forEach(c=>{c[e]=Object.create(null),Object.keys(c[I]).forEach(d=>{c[e][d]=[...c[I][d]]})}),r==="/*"&&(r="*");const a=(r.match(/\/:/g)||[]).length;if(/\*$/.test(r)){const c=gr(r);e===I?Object.keys(s).forEach(d=>{var u;(u=s[d])[r]||(u[r]=ue(s[d],r)||ue(s[I],r)||[])}):(i=s[e])[r]||(i[r]=ue(s[e],r)||ue(s[I],r)||[]),Object.keys(s).forEach(d=>{(e===I||e===d)&&Object.keys(s[d]).forEach(u=>{c.test(u)&&s[d][u].push([t,a])})}),Object.keys(n).forEach(d=>{(e===I||e===d)&&Object.keys(n[d]).forEach(u=>c.test(u)&&n[d][u].push([t,a]))});return}const o=ar(r)||[r];for(let c=0,d=o.length;c<d;c++){const u=o[c];Object.keys(n).forEach(p=>{var m;(e===I||e===p)&&((m=n[p])[u]||(m[u]=[...ue(s[p],u)||ue(s[I],u)||[]]),n[p][u].push([t,a-d+c+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(l(this,z)).concat(Object.keys(l(this,J))).forEach(r=>{e[r]||(e[r]=v(this,Le,Er).call(this,r))}),g(this,J,g(this,z,void 0)),rt(),e}},J=new WeakMap,z=new WeakMap,Le=new WeakSet,Er=function(e){const r=[];let t=e===I;return[l(this,J),l(this,z)].forEach(s=>{const n=s[e]?Object.keys(s[e]).map(a=>[a,s[e][a]]):[];n.length!==0?(t||(t=!0),r.push(...n)):e!==I&&r.push(...Object.keys(s[I]).map(a=>[a,s[I][a]]))}),t?tt(r):null},er),X,W,rr,nt=(rr=class{constructor(e){E(this,"name","SmartRouter");w(this,X,[]);w(this,W,[]);g(this,X,e.routers)}add(e,r,t){if(!l(this,W))throw new Error(pr);l(this,W).push([e,r,t])}match(e,r){if(!l(this,W))throw new Error("Fatal error");const t=l(this,X),s=l(this,W),n=t.length;let a=0,o;for(;a<n;a++){const i=t[a];try{for(let c=0,d=s.length;c<d;c++)i.add(...s[c]);o=i.match(e,r)}catch(c){if(c instanceof mr)continue;throw c}this.match=i.match.bind(i),g(this,X,[i]),g(this,W,void 0);break}if(a===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(l(this,W)||l(this,X).length!==1)throw new Error("No active router has been determined yet.");return l(this,X)[0]}},X=new WeakMap,W=new WeakMap,rr),be=Object.create(null),Q,O,oe,ye,j,V,te,we,at=(we=class{constructor(r,t,s){w(this,V);w(this,Q);w(this,O);w(this,oe);w(this,ye,0);w(this,j,be);if(g(this,O,s||Object.create(null)),g(this,Q,[]),r&&t){const n=Object.create(null);n[r]={handler:t,possibleKeys:[],score:0},g(this,Q,[n])}g(this,oe,[])}insert(r,t,s){g(this,ye,++Ve(this,ye)._);let n=this;const a=Nr(t),o=[];for(let i=0,c=a.length;i<c;i++){const d=a[i],u=a[i+1],p=Lr(d,u),m=Array.isArray(p)?p[0]:d;if(m in l(n,O)){n=l(n,O)[m],p&&o.push(p[1]);continue}l(n,O)[m]=new we,p&&(l(n,oe).push(p),o.push(p[1])),n=l(n,O)[m]}return l(n,Q).push({[r]:{handler:s,possibleKeys:o.filter((i,c,d)=>d.indexOf(i)===c),score:l(this,ye)}}),n}search(r,t){var c;const s=[];g(this,j,be);let a=[this];const o=sr(t),i=[];for(let d=0,u=o.length;d<u;d++){const p=o[d],m=d===u-1,h=[];for(let b=0,y=a.length;b<y;b++){const _=a[b],R=l(_,O)[p];R&&(g(R,j,l(_,j)),m?(l(R,O)["*"]&&s.push(...v(this,V,te).call(this,l(R,O)["*"],r,l(_,j))),s.push(...v(this,V,te).call(this,R,r,l(_,j)))):h.push(R));for(let k=0,D=l(_,oe).length;k<D;k++){const x=l(_,oe)[k],T=l(_,j)===be?{}:{...l(_,j)};if(x==="*"){const A=l(_,O)["*"];A&&(s.push(...v(this,V,te).call(this,A,r,l(_,j))),g(A,j,T),h.push(A));continue}const[Z,ee,U]=x;if(!p&&!(U instanceof RegExp))continue;const N=l(_,O)[Z],L=o.slice(d).join("/");if(U instanceof RegExp){const A=U.exec(L);if(A){if(T[ee]=A[0],s.push(...v(this,V,te).call(this,N,r,l(_,j),T)),Object.keys(l(N,O)).length){g(N,j,T);const H=((c=A[0].match(/\//))==null?void 0:c.length)??0;(i[H]||(i[H]=[])).push(N)}continue}}(U===!0||U.test(p))&&(T[ee]=p,m?(s.push(...v(this,V,te).call(this,N,r,T,l(_,j))),l(N,O)["*"]&&s.push(...v(this,V,te).call(this,l(N,O)["*"],r,T,l(_,j)))):(g(N,j,T),h.push(N)))}}a=h.concat(i.shift()??[])}return s.length>1&&s.sort((d,u)=>d.score-u.score),[s.map(({handler:d,params:u})=>[d,u])]}},Q=new WeakMap,O=new WeakMap,oe=new WeakMap,ye=new WeakMap,j=new WeakMap,V=new WeakSet,te=function(r,t,s,n){const a=[];for(let o=0,i=l(r,Q).length;o<i;o++){const c=l(r,Q)[o],d=c[t]||c[I],u={};if(d!==void 0&&(d.params=Object.create(null),a.push(d),s!==be||n&&n!==be))for(let p=0,m=d.possibleKeys.length;p<m;p++){const h=d.possibleKeys[p],b=u[d.score];d.params[h]=n!=null&&n[h]&&!b?n[h]:s[h]??(n==null?void 0:n[h]),u[d.score]=!0}}return a},we),ie,tr,ot=(tr=class{constructor(){E(this,"name","TrieRouter");w(this,ie);g(this,ie,new at)}add(e,r,t){const s=ar(r);if(s){for(let n=0,a=s.length;n<a;n++)l(this,ie).insert(e,s[n],t);return}l(this,ie).insert(e,r,t)}match(e,r){return l(this,ie).search(e,r)}},ie=new WeakMap,tr),_r=class extends Kr{constructor(e={}){super(e),this.router=e.router??new nt({routers:[new st,new ot]})}},it=e=>{const t={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},s=(a=>typeof a=="string"?a==="*"?()=>a:o=>a===o?o:null:typeof a=="function"?a:o=>a.includes(o)?o:null)(t.origin),n=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(t.allowMethods);return async function(o,i){var u;function c(p,m){o.res.headers.set(p,m)}const d=await s(o.req.header("origin")||"",o);if(d&&c("Access-Control-Allow-Origin",d),t.credentials&&c("Access-Control-Allow-Credentials","true"),(u=t.exposeHeaders)!=null&&u.length&&c("Access-Control-Expose-Headers",t.exposeHeaders.join(",")),o.req.method==="OPTIONS"){t.origin!=="*"&&c("Vary","Origin"),t.maxAge!=null&&c("Access-Control-Max-Age",t.maxAge.toString());const p=await n(o.req.header("origin")||"",o);p.length&&c("Access-Control-Allow-Methods",p.join(","));let m=t.allowHeaders;if(!(m!=null&&m.length)){const h=o.req.header("Access-Control-Request-Headers");h&&(m=h.split(/\s*,\s*/))}return m!=null&&m.length&&(c("Access-Control-Allow-Headers",m.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await i(),t.origin!=="*"&&o.header("Vary","Origin",{append:!0})}},ct=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Je=(e,r=ut)=>{const t=/\.([a-zA-Z0-9]+?)$/,s=e.match(t);if(!s)return;let n=r[s[1]];return n&&n.startsWith("text")&&(n+="; charset=utf-8"),n},dt={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ut=dt,lt=(...e)=>{let r=e.filter(n=>n!=="").join("/");r=r.replace(new RegExp("(?<=\\/)\\/+","g"),"");const t=r.split("/"),s=[];for(const n of t)n===".."&&s.length>0&&s.at(-1)!==".."?s.pop():n!=="."&&s.push(n);return s.join("/")||"."},yr={br:".br",zstd:".zst",gzip:".gz"},pt=Object.keys(yr),mt="index.html",ft=e=>{const r=e.root??"./",t=e.path,s=e.join??lt;return async(n,a)=>{var u,p,m,h;if(n.finalized)return a();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(n.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((u=e.onNotFound)==null?void 0:u.call(e,n.req.path,n)),a()}let i=s(r,!t&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(i)&&(i=s(i,mt));const c=e.getContent;let d=await c(i,n);if(d instanceof Response)return n.newResponse(d.body,d);if(d){const b=e.mimes&&Je(i,e.mimes)||Je(i);if(n.header("Content-Type",b||"application/octet-stream"),e.precompressed&&(!b||ct.test(b))){const y=new Set((p=n.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(_=>_.trim()));for(const _ of pt){if(!y.has(_))continue;const R=await c(i+yr[_],n);if(R){d=R,n.header("Content-Encoding",_),n.header("Vary","Accept-Encoding",{append:!0});break}}}return await((m=e.onFound)==null?void 0:m.call(e,i,n)),n.body(d)}await((h=e.onNotFound)==null?void 0:h.call(e,i,n)),await a()}},ht=async(e,r)=>{let t;r&&r.manifest?typeof r.manifest=="string"?t=JSON.parse(r.manifest):t=r.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?t=JSON.parse(__STATIC_CONTENT_MANIFEST):t=__STATIC_CONTENT_MANIFEST;let s;r&&r.namespace?s=r.namespace:s=__STATIC_CONTENT;const n=t[e]||e;if(!n)return null;const a=await s.get(n,{type:"stream"});return a||null},gt=e=>async function(t,s){return ft({...e,getContent:async a=>ht(a,{manifest:e.manifest,namespace:e.namespace?e.namespace:t.env?t.env.__STATIC_CONTENT:void 0})})(t,s)},Et=e=>gt(e);async function _t(e,r,t,s,n){const a={typ:"JWT",alg:"HS256",cty:"twilio-fpa;v=1"},o=Math.floor(Date.now()/1e3),i=o+3600,c={room:n},d={jti:`${r}-${o}`,iss:r,sub:e,exp:i,grants:{identity:s,video:c}},u=x=>{const T=JSON.stringify(x);return btoa(T).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},p=u(a),m=u(d),h=`${p}.${m}`,b=new TextEncoder,y=b.encode(t),_=await crypto.subtle.importKey("raw",y,{name:"HMAC",hash:"SHA-256"},!1,["sign"]),R=await crypto.subtle.sign("HMAC",_,b.encode(h)),k=new Uint8Array(R);let D=btoa(String.fromCharCode(...k));return D=D.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),`${h}.${D}`}const f=new _r;f.use("/api/*",it());f.use("/static/*",Et({root:"./public"}));async function wr(e,r,t,s,n){try{const a=`${t}/verify-email?token=${r}`,o=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${n}>`,to:e,subject:"Verify your Amebo account",html:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Welcome to Amebo! 🚀</h2>
            <p>Thank you for signing up! Please verify your email address to activate your account and start earning tokens.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${a}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #7c3aed; word-break: break-all;">${a}</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `})});if(!o.ok){const i=await o.text();return console.error("[EMAIL] Resend API error:",i),!1}return console.log("[EMAIL] Verification email sent to:",e),!0}catch(a){return console.error("[EMAIL] Send error:",a),!1}}f.post("/api/auth/register-email",async e=>{try{const{email:r,password:t}=await e.req.json();if(!r||!t)return e.json({error:"Email and password required"},400);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))return e.json({error:"Invalid email format"},400);if(await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first())return e.json({error:"Email already registered"},409);const a=crypto.randomUUID(),o=crypto.randomUUID(),i=new Date(Date.now()+1440*60*1e3),c=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),d=Array.from(new Uint8Array(c)).map(h=>h.toString(16).padStart(2,"0")).join("");await e.env.DB.prepare(`
      INSERT INTO users (
        id, username, email, public_key, email_verified, 
        verification_token, verification_expires, country_code, tokens
      ) VALUES (?, ?, ?, ?, 0, ?, ?, 'NG', 0)
    `).bind(a,r.split("@")[0],r,d,o,i.toISOString()).run();const u=e.env.APP_URL||"http://localhost:3000",p=e.env.RESEND_API_KEY||"",m=e.env.FROM_EMAIL||"onboarding@resend.dev";return p?await wr(r,o,u,p,m):console.log("[EMAIL] Verification link (RESEND_API_KEY not set):",`${u}/verify-email?token=${o}`),console.log(`[AUTH] User registered: ${r} (verification pending)`),e.json({success:!0,userId:a,email:r,message:"Registration successful! Please check your email to verify your account.",verificationRequired:!0})}catch(r){return console.error("[AUTH] Registration error:",r),e.json({error:"Registration failed"},500)}});f.get("/api/auth/verify-email/:token",async e=>{try{const r=e.req.param("token"),t=await e.env.DB.prepare(`
      SELECT id, email, verification_expires FROM users 
      WHERE verification_token = ? AND email_verified = 0
    `).bind(r).first();return t?new Date(t.verification_expires)<new Date?e.json({error:"Verification link has expired"},400):(await e.env.DB.prepare(`
      UPDATE users 
      SET email_verified = 1, 
          verification_token = NULL,
          tokens = tokens + 20
      WHERE id = ?
    `).bind(t.id).run(),await e.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier)
      VALUES (?, 'email_verified', 20, 'bronze')
    `).bind(t.id).run(),console.log(`[AUTH] Email verified: ${t.email} (+20 tokens bonus)`),e.json({success:!0,message:"Email verified successfully! You earned 20 tokens!",userId:t.id})):e.json({error:"Invalid or expired verification link"},400)}catch(r){return console.error("[AUTH] Verification error:",r),e.json({error:"Verification failed"},500)}});f.post("/api/auth/login-email",async e=>{try{const{email:r,password:t}=await e.req.json();if(!r||!t)return e.json({error:"Email and password required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(o=>o.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT id, username, email, email_verified, tokens, token_tier, created_at 
      FROM users 
      WHERE email = ? AND public_key = ?
    `).bind(r,n).first();return a?a.email_verified?(console.log(`[AUTH] User logged in: ${r}`),e.json({success:!0,user:{id:a.id,username:a.username,email:a.email,tokens:a.tokens||0,tier:a.token_tier||"bronze",emailVerified:a.email_verified===1}})):e.json({error:"Please verify your email first",verificationRequired:!0},403):e.json({error:"Invalid email or password"},401)}catch(r){return console.error("[AUTH] Login error:",r),e.json({error:"Login failed"},500)}});f.post("/api/auth/resend-verification",async e=>{try{const{email:r}=await e.req.json(),t=await e.env.DB.prepare(`
      SELECT id, email, email_verified FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({error:"Email not found"},404);if(t.email_verified===1)return e.json({error:"Email already verified"},400);const s=crypto.randomUUID(),n=new Date(Date.now()+1440*60*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `).bind(s,n.toISOString(),t.id).run();const a=e.env.APP_URL||"http://localhost:3000",o=e.env.RESEND_API_KEY||"",i=e.env.FROM_EMAIL||"onboarding@resend.dev";return o&&await wr(r,s,a,o,i),e.json({success:!0,message:"Verification email sent"})}catch(r){return console.error("[AUTH] Resend error:",r),e.json({error:"Failed to resend verification"},500)}});f.post("/api/auth/forgot-password",async e=>{try{const{email:r}=await e.req.json();if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."});const s=new Date(Date.now()-3600*1e3).toISOString();if(t.last_password_reset&&t.last_password_reset>s&&t.password_reset_attempts>=5)return e.json({error:"Too many password reset attempts. Please try again in 1 hour."},429);const n=crypto.randomUUID(),a=new Date(Date.now()+3600*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET password_reset_token = ?,
          password_reset_expires = ?,
          password_reset_attempts = password_reset_attempts + 1,
          last_password_reset = ?
      WHERE id = ?
    `).bind(n,a.toISOString(),new Date().toISOString(),t.id).run();const o=e.env.APP_URL||"http://localhost:3000",i=e.env.RESEND_API_KEY||"",c=e.env.FROM_EMAIL||"onboarding@resend.dev";if(i)try{const d=`${o}/reset-password?token=${n}`,u=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${c}>`,to:r,subject:"Reset your Amebo password",html:`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request 🔐</h2>
                <p>We received a request to reset your Amebo password.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${d}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #7c3aed; word-break: break-all;">${d}</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            `})});if(u.ok)console.log("[EMAIL] Password reset email sent to:",r);else{const p=await u.json();console.error("[EMAIL] Resend API error:",p)}}catch(d){console.error("[EMAIL] Failed to send password reset email:",d)}else console.log("[EMAIL] Password reset link (RESEND_API_KEY not set):",`${o}/reset-password?token=${n}`);return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."})}catch(r){return console.error("[AUTH] Forgot password error:",r),e.json({error:"Failed to process password reset request",message:r.message},500)}});f.post("/api/auth/reset-password",async e=>{try{const{token:r,newPassword:t}=await e.req.json();if(!r||!t)return e.json({error:"Token and new password required"},400);if(t.length<8)return e.json({error:"Password must be at least 8 characters long"},400);if(!/[A-Z]/.test(t))return e.json({error:"Password must contain at least one uppercase letter"},400);if(!/[0-9]/.test(t))return e.json({error:"Password must contain at least one number"},400);const s=await e.env.DB.prepare(`
      SELECT id, email, password_reset_expires FROM users 
      WHERE password_reset_token = ?
    `).bind(r).first();if(!s)return e.json({error:"Invalid or expired reset token"},400);const n=new Date,a=new Date(s.password_reset_expires);if(n>a)return e.json({error:"Reset token has expired. Please request a new one."},400);const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),i=Array.from(new Uint8Array(o)).map(c=>c.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET public_key = ?,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          password_reset_attempts = 0
      WHERE id = ?
    `).bind(i,s.id).run(),console.log("[AUTH] Password reset successful for:",s.email),e.json({success:!0,message:"Password reset successfully. You can now login with your new password."})}catch(r){return console.error("[AUTH] Reset password error:",r),e.json({error:"Failed to reset password",message:r.message},500)}});f.post("/api/auth/register",async e=>{var r;try{const{username:t,publicKey:s}=await e.req.json();if(!t||!s)return e.json({error:"Username and public key required"},400);const n=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO users (id, username, public_key) VALUES (?, ?, ?)
    `).bind(n,t,s).run(),e.json({success:!0,userId:n,username:t,message:"User registered successfully"})}catch(t){return(r=t.message)!=null&&r.includes("UNIQUE constraint failed")?e.json({error:"Username already exists"},409):e.json({error:"Registration failed"},500)}});f.post("/api/auth/login",async e=>{try{const{username:r}=await e.req.json(),t=await e.env.DB.prepare(`
      SELECT id, username, public_key, created_at FROM users WHERE username = ?
    `).bind(r).first();return t?e.json({success:!0,user:t}):e.json({error:"User not found"},404)}catch{return e.json({error:"Login failed"},500)}});f.get("/api/users/search",async e=>{var r;try{const t=e.req.query("q"),s=e.req.header("X-User-Email");if(!t||t.length<2)return e.json({error:"Search query must be at least 2 characters"},400);let n="";if(s){const o=await e.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(s).first();n=(o==null?void 0:o.id)||""}const a=await e.env.DB.prepare(`
      SELECT id, username, display_name, bio, email, avatar
      FROM users
      WHERE is_searchable = 1
        AND id != ?
        AND (username LIKE ? OR display_name LIKE ? OR email LIKE ?)
      LIMIT 20
    `).bind(n,`%${t}%`,`%${t}%`,`%${t}%`).all();return console.log(`[SEARCH] Query: "${t}", Found: ${((r=a.results)==null?void 0:r.length)||0} users`),e.json({success:!0,users:a.results||[]})}catch(t){return console.error("User search error:",t),e.json({error:"Search failed"},500)}});f.get("/api/users/blocked",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar, bu.blocked_at
      FROM blocked_users bu
      JOIN users u ON bu.blocked_user_id = u.id
      WHERE bu.user_id = ?
      ORDER BY bu.blocked_at DESC
    `).bind(t.id).all();return e.json({success:!0,blockedUsers:s.results||[]})}catch(r){return console.error("Get blocked users error:",r),e.json({error:"Failed to get blocked users"},500)}});f.get("/api/users/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT id, username, public_key, created_at FROM users WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,user:t}):e.json({error:"User not found"},404)}catch{return e.json({error:"Failed to fetch user"},500)}});f.post("/api/users/update-avatar",async e=>{try{const{userId:r,avatar:t}=await e.req.json();return r?(await e.env.DB.prepare(`
      UPDATE users SET avatar = ? WHERE id = ?
    `).bind(t,r).run(),e.json({success:!0,message:"Avatar updated"})):e.json({error:"User ID required"},400)}catch(r){return console.error("Avatar update error:",r),e.json({error:"Failed to update avatar"},500)}});f.post("/api/users/update-username",async e=>{try{const{userId:r,username:t}=await e.req.json();return!r||!t?e.json({error:"User ID and username required"},400):await e.env.DB.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).bind(t,r).first()?e.json({error:"Username already taken"},409):(await e.env.DB.prepare(`
      UPDATE users SET username = ? WHERE id = ?
    `).bind(t,r).run(),e.json({success:!0,message:"Username updated"}))}catch(r){return console.error("Username update error:",r),e.json({error:"Failed to update username"},500)}});f.post("/api/users/update-password",async e=>{try{const{userId:r,email:t,currentPassword:s,newPassword:n}=await e.req.json();if(!r||!s||!n)return e.json({error:"All fields required"},400);const a=await e.env.DB.prepare(`
      SELECT password_hash FROM users WHERE id = ? AND email = ?
    `).bind(r,t).first();if(!a)return e.json({error:"User not found"},404);if(!await bcrypt.compare(s,a.password_hash))return e.json({error:"Current password is incorrect"},401);const i=await bcrypt.hash(n,10);return await e.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(i,r).run(),e.json({success:!0,message:"Password updated"})}catch(r){return console.error("Password update error:",r),e.json({error:"Failed to update password"},500)}});f.post("/api/rooms/create",async e=>{var r;try{const{roomCode:t,roomName:s,userId:n}=await e.req.json();if(!t||!n)return e.json({error:"Room code and user ID required"},400);const a=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by) VALUES (?, ?, ?, ?)
    `).bind(a,t,s||"Private Chat",n).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(a,n).run(),e.json({success:!0,roomId:a,roomCode:t,message:"Room created successfully"})}catch(t){return(r=t.message)!=null&&r.includes("UNIQUE constraint failed")?e.json({error:"Room code already exists"},409):e.json({error:"Failed to create room"},500)}});f.post("/api/rooms/join",async e=>{try{const{roomCode:r,userId:t}=await e.req.json();if(!r||!t)return e.json({error:"Room code and user ID required"},400);const s=await e.env.DB.prepare(`
      SELECT id, room_code, room_name FROM chat_rooms WHERE room_code = ?
    `).bind(r).first();return s?(await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(s.id,t).first()||await e.env.DB.prepare(`
        INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
      `).bind(s.id,t).run(),e.json({success:!0,room:s,message:"Joined room successfully"})):e.json({error:"Room not found"},404)}catch{return e.json({error:"Failed to join room"},500)}});f.get("/api/rooms/user/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT cr.id, cr.room_code, cr.room_name, cr.created_at,
             (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count
      FROM chat_rooms cr
      JOIN room_members rm ON cr.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY cr.created_at DESC
    `).bind(r).all();return e.json({success:!0,rooms:t.results||[]})}catch{return e.json({error:"Failed to fetch rooms"},500)}});f.get("/api/rooms/:roomId/members",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.public_key, rm.joined_at
      FROM users u
      JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at ASC
    `).bind(r).all();return e.json({success:!0,members:t.results||[]})}catch{return e.json({error:"Failed to fetch members"},500)}});f.post("/api/users/privacy",async e=>{try{const r=e.req.header("X-User-Email"),{is_searchable:t,message_privacy:s,last_seen_privacy:n}=await e.req.json();if(!r)return e.json({error:"User email required"},400);const a=await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first();return a?(await e.env.DB.prepare(`
      UPDATE users
      SET is_searchable = ?,
          message_privacy = ?,
          last_seen_privacy = ?
      WHERE id = ?
    `).bind(t?1:0,s||"anyone",n||"everyone",a.id).run(),console.log(`[PRIVACY] Updated settings for user ${a.id}:`,{is_searchable:t,message_privacy:s,last_seen_privacy:n}),e.json({success:!0,message:"Privacy settings updated"})):e.json({error:"User not found"},404)}catch(r){return console.error("Privacy update error:",r),e.json({error:"Failed to update privacy settings"},500)}});f.get("/api/users/:userId/privacy",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT is_searchable, message_privacy, last_seen_privacy
      FROM users
      WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,privacy:{isSearchable:t.is_searchable===1,messagePrivacy:t.message_privacy||"anyone",lastSeenPrivacy:t.last_seen_privacy||"everyone"}}):e.json({error:"User not found"},404)}catch(r){return console.error("Privacy fetch error:",r),e.json({error:"Failed to fetch privacy settings"},500)}});f.post("/api/rooms/direct",async e=>{try{const{user1Id:r,user2Id:t}=await e.req.json();if(!r||!t)return e.json({error:"Both user IDs required"},400);if(r===t)return e.json({error:"Cannot create DM with yourself"},400);const s=await e.env.DB.prepare(`
      SELECT message_privacy FROM users WHERE id = ?
    `).bind(t).first();if((s==null?void 0:s.message_privacy)==="contacts_only"&&!await e.env.DB.prepare(`
        SELECT status FROM user_contacts
        WHERE user_id = ? AND contact_user_id = ? AND status = 'accepted'
      `).bind(t,r).first())return e.json({error:"This user only accepts messages from contacts",needsContact:!0},403);let n=await e.env.DB.prepare(`
      SELECT id, room_id FROM direct_message_rooms
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).bind(r,t,t,r).first();if(n){const p=await e.env.DB.prepare(`
        SELECT * FROM chat_rooms WHERE id = ?
      `).bind(n.room_id).first();return e.json({success:!0,room:p,isNew:!1})}const a=crypto.randomUUID(),o=crypto.randomUUID(),i=await e.env.DB.prepare(`
      SELECT username, display_name FROM users WHERE id = ?
    `).bind(t).first(),c=(i==null?void 0:i.display_name)||(i==null?void 0:i.username)||"Direct Message",d=`dm-${crypto.randomUUID().slice(0,8)}`;await e.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by, room_type)
      VALUES (?, ?, ?, ?, 'direct')
    `).bind(a,d,c,r).run(),await e.env.DB.prepare(`
      INSERT INTO direct_message_rooms (id, user1_id, user2_id, room_id)
      VALUES (?, ?, ?, ?)
    `).bind(o,r,t,a).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(a,r).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(a,t).run();const u=await e.env.DB.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `).bind(a).first();return e.json({success:!0,room:u,isNew:!0,message:"Direct message room created"})}catch(r){return console.error("DM creation error:",r),e.json({error:"Failed to create direct message",details:r.message},500)}});f.post("/api/messages/send",async e=>{try{const{roomId:r,senderId:t,encryptedContent:s,iv:n}=await e.req.json();if(!r||!t||!s||!n)return e.json({error:"All fields required"},400);if(!await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(r,t).first())return e.json({error:"Not a member of this room"},403);const o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO messages (id, room_id, sender_id, encrypted_content, iv) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(o,r,t,s,n).run();try{const i=await e.env.DB.prepare(`
        SELECT username FROM users WHERE id = ?
      `).bind(t).first(),c=await e.env.DB.prepare(`
        SELECT room_name, room_code FROM rooms WHERE id = ?
      `).bind(r).first(),{results:d}=await e.env.DB.prepare(`
        SELECT user_id FROM room_members WHERE room_id = ? AND user_id != ?
      `).bind(r,t).all(),u=(c==null?void 0:c.room_name)||(c==null?void 0:c.room_code)||"Unknown Room",p=(i==null?void 0:i.username)||"Someone";for(const m of d||[]){const h=crypto.randomUUID();await e.env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, data, is_read)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(h,m.user_id,"new_message",`New message in ${u}`,`${p} sent a message`,JSON.stringify({roomId:r,messageId:o,senderId:t,roomName:u})).run(),console.log(`[NOTIFICATION] Created for user ${m.user_id} in room ${u}`)}}catch(i){console.error("[NOTIFICATION] Error creating notifications:",i)}return e.json({success:!0,messageId:o,message:"Message sent successfully"})}catch{return e.json({error:"Failed to send message"},500)}});f.get("/api/messages/:roomId",async e=>{try{const r=e.req.param("roomId"),t=parseInt(e.req.query("limit")||"50"),s=parseInt(e.req.query("offset")||"0"),n=await e.env.DB.prepare(`
      SELECT m.id, m.room_id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
             u.username, u.public_key
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(r,t,s).all();return e.json({success:!0,messages:(n.results||[]).reverse()})}catch{return e.json({error:"Failed to fetch messages"},500)}});f.post("/api/twilio/token",async e=>{try{const{roomCode:r,userName:t}=await e.req.json();if(!r||!t)return e.json({error:"Room code and user name required"},400);const s=e.env.TWILIO_ACCOUNT_SID,n=e.env.TWILIO_API_KEY,a=e.env.TWILIO_API_SECRET;if(!s||!n||!a)return e.json({error:"Twilio credentials not configured",message:"Please configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET in environment variables. See TWILIO_SETUP_GUIDE.md for details."},503);const o=t,i=r,c=await _t(s,n,a,o,i);return e.json({success:!0,token:c,identity:o,roomName:i,message:"Access token generated successfully"})}catch(r){return console.error("Twilio token generation error:",r),e.json({error:"Failed to generate access token",details:r.message},500)}});f.post("/api/notifications/subscribe",async e=>{try{const{userId:r,subscription:t}=await e.req.json();return!r||!t?e.json({error:"User ID and subscription required"},400):(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (user_id, subscription_data, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(r,JSON.stringify(t)).run(),e.json({success:!0,message:"Push subscription saved successfully"}))}catch{return e.json({error:"Failed to save subscription"},500)}});f.post("/api/notifications/send",async e=>{try{const{userId:r,title:t,body:s,data:n}=await e.req.json();if(!r||!t)return e.json({error:"User ID and title required"},400);const a=await e.env.DB.prepare(`
      SELECT subscription_data FROM push_subscriptions WHERE user_id = ?
    `).bind(r).first();if(!a)return e.json({error:"No push subscription found for user"},404);const o=JSON.parse(a.subscription_data);return e.json({success:!0,message:"Notification sent successfully",note:"Implement actual Web Push in production"})}catch{return e.json({error:"Failed to send notification"},500)}});f.post("/api/payments/naira/initialize",async e=>{try{const{userId:r,email:t,amount:s,reference:n}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, email, and amount required"},400);const a=n||`NGN-${Date.now()}-${crypto.randomUUID().slice(0,8)}`,o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO transactions (id, user_id, type, currency, amount, reference, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(o,r,"send","NGN",s.toString(),a,"pending",JSON.stringify({email:t})).run();const i=e.env.PAYSTACK_SECRET_KEY;if(i&&i!=="your_key_here")try{const d=await(await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({email:t,amount:Math.round(s*100),reference:a,callback_url:`${new URL(e.req.url).origin}/api/payments/naira/verify/${a}`})})).json();if(d.status)return e.json({success:!0,reference:a,authorizationUrl:d.data.authorization_url,accessCode:d.data.access_code,message:"Payment initialized. Redirecting to Paystack..."});throw new Error(d.message||"Paystack initialization failed")}catch(c){return console.error("Paystack API error:",c),e.json({error:"Payment initialization failed",details:c.message,note:"Please check your Paystack API key"},500)}else return e.json({success:!0,reference:a,authorizationUrl:`https://checkout.paystack.com/demo/${a}`,message:"⚠️ DEMO MODE: Add PAYSTACK_SECRET_KEY to use real payments. Get your key at https://paystack.com",demo:!0})}catch{return e.json({error:"Failed to initialize payment"},500)}});f.get("/api/payments/naira/verify/:reference",async e=>{var r;try{const t=e.req.param("reference"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions WHERE reference = ?
    `).bind(t).first();if(!s)return e.json({error:"Transaction not found"},404);const n=e.env.PAYSTACK_SECRET_KEY;if(n&&n!=="your_key_here")try{const o=await(await fetch(`https://api.paystack.co/transaction/verify/${t}`,{method:"GET",headers:{Authorization:`Bearer ${n}`}})).json();if(o.status&&o.data.status==="success")return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind("completed",t).run(),e.json({success:!0,status:"completed",amount:o.data.amount/100,currency:o.data.currency,paidAt:o.data.paid_at,channel:o.data.channel});{const i=((r=o.data)==null?void 0:r.status)||"failed";return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind(i,t).run(),e.json({success:!1,status:i,message:o.message||"Payment verification failed"})}}catch(a){return console.error("Paystack verification error:",a),e.json({error:"Verification failed",details:a.message},500)}else return await e.env.DB.prepare(`
        UPDATE transactions SET status = ? WHERE reference = ?
      `).bind("completed",t).run(),e.json({success:!0,status:"completed",amount:s.amount,currency:s.currency,demo:!0,message:"⚠️ DEMO MODE: Transaction auto-completed. Add PAYSTACK_SECRET_KEY for real verification."})}catch{return e.json({error:"Failed to verify payment"},500)}});f.get("/api/transactions/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,transactions:s.results||[]})}catch{return e.json({error:"Failed to fetch transactions"},500)}});f.get("/api/crypto/bitcoin/:address",async e=>{try{const r=e.req.param("address");try{const t=await fetch(`https://blockchain.info/q/addressbalance/${r}`);if(t.ok){const s=await t.text(),n=(parseInt(s)/1e8).toFixed(8);return e.json({success:!0,currency:"BTC",address:r,balance:n,balanceSatoshi:s})}else throw new Error("Failed to fetch Bitcoin balance")}catch(t){return console.error("Blockchain.info API error:",t),e.json({success:!0,currency:"BTC",address:r,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance from Blockchain.info",error:t.message})}}catch{return e.json({error:"Failed to fetch Bitcoin balance"},500)}});f.get("/api/crypto/ethereum/:address",async e=>{try{const r=e.req.param("address"),t=e.env.ETHERSCAN_API_KEY;try{const s=t&&t.length===32&&t!=="your_key_here",n=s?`https://api.etherscan.io/api?module=account&action=balance&address=${r}&tag=latest&apikey=${t}`:`https://api.etherscan.io/api?module=account&action=balance&address=${r}&tag=latest`,o=await(await fetch(n)).json();if(o.status==="1"&&o.result){const i=(parseInt(o.result)/1e18).toFixed(8);return e.json({success:!0,currency:"ETH",address:r,balance:i,balanceWei:o.result,note:s?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(o.message&&o.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:o.message},429);throw new Error(o.message||"Failed to fetch balance")}}catch(s){return console.error("Etherscan API error:",s),e.json({success:!0,currency:"ETH",address:r,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:s.message})}}catch{return e.json({error:"Failed to fetch Ethereum balance"},500)}});f.get("/api/crypto/usdt/:address",async e=>{try{const r=e.req.param("address"),t=e.env.ETHERSCAN_API_KEY,s="0xdac17f958d2ee523a2206206994597c13d831ec7";try{const n=t&&t.length===32&&t!=="your_key_here",a=n?`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${r}&tag=latest&apikey=${t}`:`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${r}&tag=latest`,i=await(await fetch(a)).json();if(i.status==="1"&&i.result){const c=(parseInt(i.result)/1e6).toFixed(6);return e.json({success:!0,currency:"USDT",address:r,balance:c,balanceRaw:i.result,network:"Ethereum (ERC-20)",note:n?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(i.message&&i.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:i.message},429);throw new Error(i.message||"Failed to fetch balance")}}catch(n){return console.error("Etherscan USDT API error:",n),e.json({success:!0,currency:"USDT",address:r,balance:"0.000000",demo:!0,network:"Ethereum (ERC-20)",message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:n.message})}}catch{return e.json({error:"Failed to fetch USDT balance"},500)}});f.get("/test",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Test Page</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
    </head>
    <body class="bg-gray-900 text-white p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-4">🔧 API Test Page</h1>
            <p class="mb-4">Test the backend APIs directly to see if they're working.</p>
            
            <div class="space-y-4">
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 1: Login/Register</h2>
                    <button onclick="testAuth()" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                        Test Auth
                    </button>
                    <div id="auth-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 2: Create Room</h2>
                    <button onclick="testCreateRoom()" class="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                        Test Create Room
                    </button>
                    <div id="room-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Console Output</h2>
                    <div id="console" class="bg-black p-4 rounded font-mono text-xs h-64 overflow-auto"></div>
                </div>
            </div>
        </div>

        <script>
            let userId = null;
            const consoleDiv = document.getElementById('console');
            
            function log(msg) {
                console.log(msg);
                const time = new Date().toLocaleTimeString();
                consoleDiv.innerHTML += time + ': ' + msg + '<br>';
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }
            
            async function testAuth() {
                log('Testing auth...');
                const username = 'TestUser' + Date.now();
                
                try {
                    // Try login
                    log('POST /api/auth/login');
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    let data = await res.json();
                    log('Login response: ' + JSON.stringify(data));
                    
                    if (!res.ok) {
                        // Register
                        log('POST /api/auth/register');
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'test-key-123'})
                        });
                        data = await res.json();
                        log('Register response: ' + JSON.stringify(data));
                        
                        if (res.ok) {
                            userId = data.userId;
                            document.getElementById('auth-result').innerHTML = 
                                '<span class="text-green-400">✓ Success! User ID: ' + userId + '</span>';
                            log('✓ Auth successful');
                            return;
                        }
                    } else {
                        userId = data.user.id;
                        document.getElementById('auth-result').innerHTML = 
                            '<span class="text-green-400">✓ Login successful! User ID: ' + userId + '</span>';
                        log('✓ Login successful');
                        return;
                    }
                    
                    throw new Error('Auth failed');
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('auth-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            async function testCreateRoom() {
                if (!userId) {
                    alert('Run Test Auth first!');
                    return;
                }
                
                log('Testing create room...');
                const roomCode = 'test' + Date.now();
                
                try {
                    log('POST /api/rooms/create');
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Test Room',
                            userId
                        })
                    });
                    const data = await res.json();
                    log('Create response: ' + JSON.stringify(data));
                    
                    if (res.ok) {
                        document.getElementById('room-result').innerHTML = 
                            '<span class="text-green-400">✓ Room created! ID: ' + data.roomId + '</span>';
                        log('✓ Room created successfully');
                        
                        // Test load messages
                        log('GET /api/messages/' + data.roomId);
                        const msgRes = await fetch('/api/messages/' + data.roomId);
                        const msgData = await msgRes.json();
                        log('Messages response: ' + JSON.stringify(msgData));
                        log('✓✓ ALL TESTS PASSED!');
                    } else {
                        throw new Error(data.error || 'Failed');
                    }
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('room-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            log('Test page loaded. Run tests above.');
        <\/script>
    </body>
    </html>
  `));f.get("/simple",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amebo - Simple Version</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script>
            // Simple app without caching issues
            let currentUser = null;
            let currentRoom = null;
            
            function renderLogin() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <div class="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-shield-alt text-white text-3xl"></i>
                                </div>
                                <h1 class="text-3xl font-bold text-gray-800">Amebo</h1>
                                <p class="text-gray-600 mt-2">Simple Working Version</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Enter username"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            
                            <button 
                                onclick="handleLogin()"
                                class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Login / Register
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderRoomPrompt() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <h2 class="text-2xl font-bold text-gray-800">Welcome, \${currentUser.username}!</h2>
                                <p class="text-gray-600 mt-2">Enter room code</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="roomcode" 
                                placeholder="Enter room code"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            
                            <button 
                                onclick="handleJoinRoom()"
                                class="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 mb-3"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Join Room
                            </button>
                            
                            <button 
                                onclick="handleCreateRoom()"
                                class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 mb-3"
                            >
                                <i class="fas fa-plus-circle mr-2"></i>Create New Room
                            </button>
                            
                            <button 
                                onclick="renderLogin()"
                                class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                            >
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderChat() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gray-50 flex flex-col">
                        <div class="bg-teal-600 text-white p-4 flex items-center justify-between">
                            <div>
                                <div class="font-bold">\${currentRoom.room_name}</div>
                                <div class="text-xs">Room Code: \${currentRoom.room_code}</div>
                            </div>
                            <button onclick="renderRoomPrompt()" class="hover:bg-teal-700 px-3 py-2 rounded">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                        </div>
                        
                        <div class="flex-1 p-4 overflow-y-auto" id="messages">
                            <div class="text-center text-gray-500 py-8">
                                <p class="text-lg font-semibold">🎉 You're in the chat room!</p>
                                <p class="text-sm mt-2">Room: \${currentRoom.room_name}</p>
                                <p class="text-xs mt-1">Code: \${currentRoom.room_code}</p>
                                <p class="text-xs mt-4 text-green-600">✅ Backend is working perfectly!</p>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-white border-t">
                            <div class="flex space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    class="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button class="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            async function handleLogin() {
                const username = document.getElementById('username').value.trim();
                if (!username) {
                    alert('Please enter a username');
                    return;
                }
                
                try {
                    // Try login
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    
                    let data = await res.json();
                    
                    if (!res.ok) {
                        // Register
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'simple-key-' + Date.now()})
                        });
                        data = await res.json();
                    }
                    
                    if (res.ok) {
                        currentUser = {
                            id: data.userId || data.user.id,
                            username: username
                        };
                        renderRoomPrompt();
                    } else {
                        alert('Login failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleCreateRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                if (roomCode.length < 6) {
                    alert('Room code must be at least 6 characters');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Room ' + roomCode.substring(0, 8),
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        currentRoom = {
                            id: data.roomId,
                            room_code: roomCode,
                            room_name: 'Room ' + roomCode.substring(0, 8)
                        };
                        renderChat();
                    } else {
                        alert('Create failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleJoinRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/join', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        // Load room info
                        const roomsRes = await fetch('/api/rooms/user/' + currentUser.id);
                        const roomsData = await roomsRes.json();
                        const room = roomsData.rooms.find(r => r.room_code === roomCode);
                        
                        if (room) {
                            currentRoom = room;
                            renderChat();
                        } else {
                            alert('Room joined but not found in your rooms list');
                        }
                    } else {
                        alert('Join failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            // Start app
            renderLogin();
        <\/script>
    </body>
    </html>
  `));f.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="theme-color" content="#4F46E5">
        <meta name="description" content="Secure encrypted messaging and payments">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>Amebo</title>
        
        <link rel="manifest" href="/static/manifest.json">
        <link rel="icon" type="image/svg+xml" href="/static/icon-192.svg">
        <link rel="apple-touch-icon" href="/static/icon-512.svg">
        
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .chat-message { animation: slideIn 0.3s ease-out; }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .loading-spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #4F46E5;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <!-- V3 INDUSTRIAL GRADE - E2E Encryption + Token System + Enhanced Features -->
        <script src="/static/crypto-v2.js?v=20251221-fresh"><\/script>
        <script src="/static/app-v3.js?v=20251221-fresh"><\/script>
        
        <script>
          // Register service worker for PWA
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
            });
          }
        <\/script>
    </body>
    </html>
  `));function qe(e){return e>=1e3?{tier:"platinum",multiplier:2}:e>=500?{tier:"gold",multiplier:1.5}:e>=100?{tier:"silver",multiplier:1.2}:{tier:"bronze",multiplier:1}}async function br(e,r,t){const s=new Date().toISOString().substring(0,7),n=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first(),a=(n==null?void 0:n.cap_value)||1500,o=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'warning_threshold' AND is_active = 1
  `).first(),i=(o==null?void 0:o.cap_value)||1400;let c=await e.prepare(`
    SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(r,s).first();c||(await e.prepare(`
      INSERT INTO monthly_earning_caps (user_id, year_month, total_earned, messages_count, files_count, rooms_created_count, rooms_joined_count)
      VALUES (?, ?, 0, 0, 0, 0, 0)
    `).bind(r,s).run(),c={total_earned:0});const d=c.total_earned||0,u=a-d;if(d+t>a)return await e.prepare(`
      INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
      VALUES (?, ?, 'cap_exceeded', ?, ?, ?, 1)
    `).bind(r,s,t,d,a).run(),{allowed:!1,reason:`Monthly token limit reached! You've earned ${d}/${a} tokens this month. Resets next month.`,current:d,limit:a,remaining:u>0?u:0,isWarning:!1};const p=d+t>=i;return{allowed:!0,current:d,limit:a,remaining:u-t,isWarning:p}}async function vr(e,r,t,s){const n=new Date().toISOString().substring(0,7);let a="";switch(s){case"message":case"message_sent":a="messages_count";break;case"file_share":case"file_shared":a="files_count";break;case"room_create":a="rooms_created_count";break;case"room_join":a="rooms_joined_count";break}a?await e.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          ${a} = ${a} + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(t,r,n).run():await e.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(t,r,n).run();const o=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first(),i=(o==null?void 0:o.cap_value)||1500,c=await e.prepare(`
    SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(r,n).first(),d=(c==null?void 0:c.total_earned)||0;await e.prepare(`
    INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).bind(r,n,s,t,d,i).run(),await e.prepare(`
    UPDATE users 
    SET current_month_tokens = ?,
        last_token_reset_month = ?
    WHERE id = ?
  `).bind(d,n,r).run()}async function yt(e,r,t,s){const n=new Date().toISOString().split("T")[0];let a=await e.prepare(`
    SELECT * FROM daily_earning_caps WHERE user_id = ? AND date = ?
  `).bind(r,n).first();a||(await e.prepare(`
      INSERT INTO daily_earning_caps (user_id, date, messages_count, files_count, total_earned)
      VALUES (?, ?, 0, 0, 0)
    `).bind(r,n).run(),a={messages_count:0,files_count:0,total_earned:0});const o=100,i=60,c=500;return t==="message_sent"&&a.messages_count+s>o?{allowed:!1,reason:"Daily message token limit reached",current:a.messages_count,limit:o}:t==="file_shared"&&a.files_count+s>i?{allowed:!1,reason:"Daily file sharing token limit reached",current:a.files_count,limit:i}:a.total_earned+s>c?{allowed:!1,reason:"Daily total token limit reached",current:a.total_earned,limit:c}:{allowed:!0}}f.post("/api/tokens/award",async e=>{try{const{userId:r,amount:t,reason:s}=await e.req.json();if(!r||!t)return e.json({error:"User ID and amount required"},400);if(t<=0)return e.json({error:"Amount must be greater than 0"},400);const n=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned FROM users WHERE id = ?
    `).bind(r).first();if(!n)return e.json({error:"User not found"},404);const a=n.tokens||0,{tier:o,multiplier:i}=qe(a),c=await br(e.env.DB,r,t);if(!c.allowed)return console.log(`[TOKEN ECONOMY] ❌ Monthly limit reached for ${r}: ${c.reason}`),e.json({error:c.reason,monthlyLimitReached:!0,current:c.current,limit:c.limit,remaining:c.remaining},429);const d=["message_sent","file_shared","message","file_share"];if(d.includes(s)){const y=await yt(e.env.DB,r,s,t);if(!y.allowed)return console.log(`[TOKEN ECONOMY] ⚠️ Daily limit reached for ${r}: ${y.reason}`),e.json({error:y.reason,dailyLimitReached:!0,current:y.current,limit:y.limit},429)}const u=Math.floor(t*i),p=a+u,m=qe(p).tier;if(await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?, 
          token_tier = ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(u,m,u,r).run(),await e.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier, daily_total)
      VALUES (?, ?, ?, ?, ?)
    `).bind(r,s,u,o,u).run(),d.includes(s)){const y=new Date().toISOString().split("T")[0],_=s==="message_sent"||s==="message"?"messages_count":"files_count";await e.env.DB.prepare(`
        UPDATE daily_earning_caps 
        SET ${_} = ${_} + ?,
            total_earned = total_earned + ?
        WHERE user_id = ? AND date = ?
      `).bind(u,u,r,y).run()}await vr(e.env.DB,r,u,s);const h=i>1?` (${o} tier ${i}x bonus!)`:"",b=c.isWarning?` ⚠️ Approaching monthly limit (${c.current+u}/${c.limit})`:"";return console.log(`[TOKEN ECONOMY] User ${r} earned ${u} tokens for ${s}${h}. New balance: ${p}${b}`),e.json({success:!0,newBalance:p,amount:u,baseAmount:t,multiplier:i,tier:m,tierBonus:i>1,reason:s,monthlyLimit:c.limit,monthlyEarned:c.current+u,monthlyRemaining:c.remaining,monthlyWarning:c.isWarning,monthlyPercentage:Math.floor((c.current+u)/c.limit*100)})}catch(r){return console.error("Award tokens error:",r),e.json({error:"Failed to award tokens"},500)}});f.get("/api/tokens/balance/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned, total_spent FROM users WHERE id = ?
    `).bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=t.tokens||0,{tier:n,multiplier:a}=qe(s),o=new Date().toISOString().split("T")[0],i=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(r,o).first();return e.json({success:!0,balance:s,tier:n,multiplier:a,totalEarned:t.total_earned||0,totalSpent:t.total_spent||0,dailyProgress:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,total:(i==null?void 0:i.total_earned)||0,limits:{messages:100,files:60,total:500}},nextTier:n==="bronze"?"silver (100 tokens)":n==="silver"?"gold (500 tokens)":n==="gold"?"platinum (1000 tokens)":"max tier reached"})}catch(r){return console.error("Get balance error:",r),e.json({error:"Failed to get balance"},500)}});f.get("/api/tokens/stats/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().split("T")[0],s=await e.env.DB.prepare(`
      SELECT username, tokens, token_tier, total_earned, total_spent,
             email, email_verified
      FROM users 
      WHERE id = ?
    `).bind(r).first();if(!s)return e.json({error:"User not found"},404);const a=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned
      FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(r,t).first()||{messages_count:0,files_count:0,total_earned:0};return e.json({success:!0,data:{username:s.username,email:s.email,token_balance:s.tokens,token_tier:s.token_tier,total_tokens_earned:s.total_earned||0,total_tokens_spent:s.total_spent||0,daily_messages_sent:a.messages_count,daily_files_sent:a.files_count,daily_tokens_earned:a.total_earned,daily_message_cap:100,daily_file_cap:60,daily_total_cap:500}})}catch(r){return console.error("Get stats error:",r),e.json({error:"Failed to get stats"},500)}});f.get("/api/tokens/history/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT action as type, amount, tier, created_at 
      FROM token_earnings 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,data:s.results||[]})}catch(r){return console.error("Get history error:",r),e.json({error:"Failed to get history"},500)}});f.get("/api/tokens/monthly/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
      SELECT cap_name, cap_value FROM monthly_cap_config WHERE is_active = 1
    `).all(),n={};s.results.forEach(h=>{n[h.cap_name]=h.cap_value});const a=n.monthly_total_cap||1500,o=n.warning_threshold||1400,i=await e.env.DB.prepare(`
      SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(r,t).first(),c=(i==null?void 0:i.total_earned)||0,d=a-c,u=Math.floor(c/a*100);let p="normal";c>=a?p="capped":c>=o&&(p="warning");const m=await e.env.DB.prepare(`
      SELECT action, tokens_earned, tokens_total, created_at
      FROM monthly_cap_history
      WHERE user_id = ? AND year_month = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(r,t).all();return e.json({success:!0,data:{yearMonth:t,earned:c,limit:a,remaining:d>0?d:0,percentage:u,status:p,warningThreshold:o,breakdown:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,roomsCreated:(i==null?void 0:i.rooms_created_count)||0,roomsJoined:(i==null?void 0:i.rooms_joined_count)||0},history:m.results||[]}})}catch(r){return console.error("Get monthly stats error:",r),e.json({error:"Failed to get monthly stats"},500)}});f.post("/api/tokens/bonus/award",async e=>{try{const{userId:r,bonusType:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and bonus type required"},400);const s=new Date().toISOString().substring(0,7);if(await e.env.DB.prepare(`
      SELECT * FROM user_bonus_achievements 
      WHERE user_id = ? AND year_month = ? AND bonus_type = ?
    `).bind(r,s,t).first())return e.json({error:"Bonus already awarded this month",alreadyAwarded:!0},400);const a=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config 
      WHERE cap_name = ? AND is_active = 1
    `).bind(`bonus_${t}`).first();if(!a)return e.json({error:"Invalid bonus type"},400);const o=a.cap_value,i=await br(e.env.DB,r,o);if(!i.allowed)return e.json({error:`Cannot award bonus - monthly limit reached (${i.current}/${i.limit})`,monthlyLimitReached:!0,current:i.current,limit:i.limit},429);const c=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(r).first();if(!c)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(o,o,r).run(),await e.env.DB.prepare(`
      INSERT INTO user_bonus_achievements (user_id, year_month, bonus_type, bonus_amount)
      VALUES (?, ?, ?, ?)
    `).bind(r,s,t,o).run(),await vr(e.env.DB,r,o,`bonus_${t}`);const d=(c.tokens||0)+o;return console.log(`[BONUS] User ${r} earned ${o} bonus tokens for ${t}. New balance: ${d}`),e.json({success:!0,bonusType:t,bonusAmount:o,newBalance:d,message:`🎉 +${o} bonus tokens!`,monthlyEarned:i.current+o,monthlyLimit:i.limit,monthlyRemaining:i.remaining})}catch(r){return console.error("Award bonus error:",r),e.json({error:"Failed to award bonus"},500)}});f.get("/api/tokens/bonus/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
      SELECT bonus_type, bonus_amount, earned_at
      FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
      ORDER BY earned_at DESC
    `).bind(r,t).all(),n=await e.env.DB.prepare(`
      SELECT SUM(bonus_amount) as total FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
    `).bind(r,t).first(),a=(n==null?void 0:n.total)||0,o=await e.env.DB.prepare(`
      SELECT cap_name, cap_value, description 
      FROM monthly_cap_config 
      WHERE cap_name LIKE 'bonus_%' AND is_active = 1
    `).all(),i=s.results.map(h=>h.bonus_type),c=o.results.filter(h=>{const b=h.cap_name.replace("bonus_","");return!i.includes(b)}).map(h=>({type:h.cap_name.replace("bonus_",""),amount:h.cap_value,description:h.description})),d=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
    `).first(),u=(d==null?void 0:d.cap_value)||1500,p=await e.env.DB.prepare(`
      SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(r,t).first(),m=(p==null?void 0:p.total_earned)||0;return e.json({success:!0,data:{monthlyLimit:u,monthlyEarned:m,monthlyRemaining:u-m,totalBonusTokensEarned:a,earned:s.results||[],available:c,note:"Bonuses award instant tokens that count toward the 1500 monthly limit"}})}catch(r){return console.error("Get bonuses error:",r),e.json({error:"Failed to get bonuses"},500)}});f.post("/api/users/pin/set",async e=>{try{const{userId:r,pin:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and PIN required"},400);if(t.length!==4||!/^\d{4}$/.test(t))return e.json({error:"PIN must be exactly 4 digits"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(a=>a.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users SET pin = ? WHERE id = ?
    `).bind(n,r).run(),e.json({success:!0,message:"PIN set successfully"})}catch(r){return console.error("Set PIN error:",r),e.json({error:"Failed to set PIN"},500)}});f.post("/api/users/pin/verify",async e=>{try{const{userId:r,pin:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and PIN required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(i=>i.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(r).first();if(!a||!a.pin)return e.json({verified:!1,error:"No PIN set"},400);const o=a.pin===n;return e.json({verified:o})}catch(r){return console.error("Verify PIN error:",r),e.json({error:"Failed to verify PIN"},500)}});f.get("/api/users/:userId/has-pin",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(r).first();return e.json({hasPin:!!(t&&t.pin)})}catch(r){return console.error("Check PIN error:",r),e.json({error:"Failed to check PIN"},500)}});f.post("/api/users/pin/security-question",async e=>{try{const{userId:r,question:t,answer:s}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, question, and answer required"},400);if(s.trim().length<3)return e.json({error:"Answer must be at least 3 characters"},400);const n=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s.toLowerCase().trim())),a=Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET security_question = ?, security_answer = ?
      WHERE id = ?
    `).bind(t,a,r).run(),console.log(`[SECURITY] User ${r} set security question`),e.json({success:!0,message:"Security question set successfully"})}catch(r){return console.error("Set security question error:",r),e.json({error:"Failed to set security question"},500)}});f.get("/api/users/:userId/security-question",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT security_question FROM users WHERE id = ?
    `).bind(r).first();return!t||!t.security_question?e.json({error:"No security question set"},404):e.json({success:!0,question:t.security_question})}catch(r){return console.error("Get security question error:",r),e.json({error:"Failed to get security question"},500)}});f.post("/api/users/pin/reset",async e=>{try{const{userId:r,answer:t,newPin:s}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, answer, and new PIN required"},400);if(s.length!==4||!/^\d{4}$/.test(s))return e.json({error:"PIN must be exactly 4 digits"},400);const n=await e.env.DB.prepare(`
      SELECT security_answer, pin_reset_attempts, last_pin_reset FROM users WHERE id = ?
    `).bind(r).first();if(!n||!n.security_answer)return e.json({error:"No security question set"},404);const a=new Date;if(n.last_pin_reset){const u=new Date(n.last_pin_reset),p=(a.getTime()-u.getTime())/(1e3*60*60);if(p<1&&n.pin_reset_attempts>=5)return e.json({error:"Too many reset attempts. Please try again in 1 hour.",remainingTime:Math.ceil((1-p)*60)},429);p>=1&&await e.env.DB.prepare(`
          UPDATE users SET pin_reset_attempts = 0 WHERE id = ?
        `).bind(r).run()}const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t.toLowerCase().trim())),i=Array.from(new Uint8Array(o)).map(u=>u.toString(16).padStart(2,"0")).join("");if(n.security_answer!==i){await e.env.DB.prepare(`
        UPDATE users 
        SET pin_reset_attempts = pin_reset_attempts + 1,
            last_pin_reset = ?
        WHERE id = ?
      `).bind(a.toISOString(),r).run();const u=(n.pin_reset_attempts||0)+1,p=5-u;return console.log(`[PIN RESET] Failed attempt for user ${r}. Attempts: ${u}/5`),e.json({error:"Incorrect answer",verified:!1,remainingAttempts:Math.max(0,p)},400)}const c=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)),d=Array.from(new Uint8Array(c)).map(u=>u.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET pin = ?, 
          pin_reset_attempts = 0,
          last_pin_reset = ?
      WHERE id = ?
    `).bind(d,a.toISOString(),r).run(),console.log(`[PIN RESET] User ${r} successfully reset PIN`),e.json({success:!0,verified:!0,message:"PIN reset successfully"})}catch(r){return console.error("Reset PIN error:",r),e.json({error:"Failed to reset PIN"},500)}});f.post("/api/tokens/gift",async e=>{try{const{fromUserId:r,toUserId:t,amount:s,roomId:n,message:a,pin:o}=await e.req.json();if(!r||!t||!s||!o)return e.json({error:"From user, to user, amount, and PIN required"},400);if(s<=0)return e.json({error:"Amount must be greater than 0"},400);if(r===t)return e.json({error:"Cannot send tokens to yourself"},400);const i=new Date,c=new Date(i.getFullYear(),0,1),d=Math.floor((i.getTime()-c.getTime())/(1440*60*1e3)),u=Math.ceil((d+c.getDay()+1)/7),p=`${i.getFullYear()}-${String(u).padStart(2,"0")}`,m=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),h=(m==null?void 0:m.config_value)||150;let b=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(r,p).first();b||(await e.env.DB.prepare(`
        INSERT INTO weekly_gift_tracking (user_id, year_week, total_gifted, gift_count)
        VALUES (?, ?, 0, 0)
      `).bind(r,p).run(),b={user_id:r,year_week:p,total_gifted:0,gift_count:0});const y=b.total_gifted||0,_=h-y;if(y+s>h)return console.log(`[WEEKLY GIFT LIMIT] User ${r} exceeded weekly limit. Current: ${y}, Attempting: ${s}, Limit: ${h}`),await e.env.DB.prepare(`
        INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).bind(r,p,s,t,y,h).run(),e.json({error:`Weekly gift limit reached! You can only gift ${h} tokens per week. You have gifted ${y} tokens this week. Remaining: ${_} tokens`,weeklyLimit:h,weeklyGifted:y,weeklyRemaining:_,limitExceeded:!0},400);const R=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(o)),k=Array.from(new Uint8Array(R)).map(Tr=>Tr.toString(16).padStart(2,"0")).join(""),D=await e.env.DB.prepare(`
      SELECT pin, tokens, username FROM users WHERE id = ?
    `).bind(r).first();if(!D)return e.json({error:"User not found"},404);if(!D.pin)return e.json({error:"Please set a PIN first"},400);if(D.pin!==k)return e.json({error:"Invalid PIN"},401);const x=D.tokens||0;if(x<s)return e.json({error:`Insufficient tokens. You have ${x} tokens`},400);const T=await e.env.DB.prepare(`
      SELECT username, tokens FROM users WHERE id = ?
    `).bind(t).first();if(!T)return e.json({error:"Recipient not found"},404);console.log(`[TOKEN GIFT] ${D.username} sending ${s} tokens to ${T.username} (Weekly: ${y+s}/${h})`);const Z=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens - ? WHERE id = ?
    `).bind(s,r).run();console.log(`[TOKEN GIFT] Deducted ${s} tokens from sender`);const ee=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens + ? WHERE id = ?
    `).bind(s,t).run();console.log(`[TOKEN GIFT] Added ${s} tokens to receiver`);const U=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO token_transactions (id, from_user_id, to_user_id, amount, room_id, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(U,r,t,s,n||null,a||null).run(),console.log(`[TOKEN GIFT] Transaction recorded: ${U}`);const N=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(N,t,"token_gift","🎁 Token Gift Received!",`${D.username} sent you ${s} tokens${a?": "+a:""}`,JSON.stringify({fromUserId:r,amount:s,message:a,transactionId:U})).run(),console.log("[TOKEN GIFT] Notification created for receiver");const L=y+s;await e.env.DB.prepare(`
      UPDATE weekly_gift_tracking 
      SET total_gifted = ?, gift_count = gift_count + 1, last_gift_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_week = ?
    `).bind(L,r,p).run(),console.log(`[WEEKLY GIFT TRACKING] Updated: ${L}/${h} tokens gifted this week`),await e.env.DB.prepare(`
      INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).bind(r,p,s,t,L,h).run();const A=x-s,H=(T.tokens||0)+s,de=h-L;let Pe="";return de<=30&&de>0?Pe=` ⚠️ Only ${de} tokens remaining this week!`:de===0&&(Pe=" 🚫 Weekly gift limit reached!"),e.json({success:!0,message:`Successfully sent ${s} tokens to ${T.username}${Pe}`,transactionId:U,newBalance:A,receiverUsername:T.username,receiverBalance:H,fromUsername:D.username,weeklyGifted:L,weeklyLimit:h,weeklyRemaining:de})}catch(r){return console.error("Gift tokens error:",r),e.json({error:"Failed to gift tokens",details:r.message},500)}});f.get("/api/tokens/weekly-gift-status/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date,s=new Date(t.getFullYear(),0,1),n=Math.floor((t.getTime()-s.getTime())/(1440*60*1e3)),a=Math.ceil((n+s.getDay()+1)/7),o=`${t.getFullYear()}-${String(a).padStart(2,"0")}`,i=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),c=(i==null?void 0:i.config_value)||150,d=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(r,o).first(),u=(d==null?void 0:d.total_gifted)||0,p=(d==null?void 0:d.gift_count)||0,m=c-u;return e.json({success:!0,yearWeek:o,weeklyLimit:c,totalGifted:u,remaining:m,giftCount:p,lastGiftAt:(d==null?void 0:d.last_gift_at)||null,limitReached:u>=c,percentageUsed:Math.round(u/c*100)})}catch(r){return console.error("Get weekly gift status error:",r),e.json({error:"Failed to get weekly gift status"},500)}});f.get("/api/tokens/history/:userId",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
      SELECT 
        t.*,
        u_from.username as from_username,
        u_to.username as to_username
      FROM token_transactions t
      LEFT JOIN users u_from ON t.from_user_id = u_from.id
      LEFT JOIN users u_to ON t.to_user_id = u_to.id
      WHERE t.from_user_id = ? OR t.to_user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 50
    `).bind(r,r).all();return e.json({success:!0,transactions:t||[]})}catch(r){return console.error("Get token history error:",r),e.json({error:"Failed to get token history"},500)}});f.get("/api/rooms/:roomId/members",async e=>{try{const r=e.req.param("roomId"),{results:t}=await e.env.DB.prepare(`
      SELECT DISTINCT u.id, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY u.username
    `).bind(r).all();return e.json({success:!0,members:t||[]})}catch(r){return console.error("Get room members error:",r),e.json({error:"Failed to get room members"},500)}});f.get("/api/notifications/:userId",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(r).all();return e.json({success:!0,notifications:t||[]})}catch(r){return console.error("Get notifications error:",r),e.json({error:"Failed to get notifications"},500)}});f.post("/api/notifications/:notificationId/read",async e=>{try{const r=e.req.param("notificationId");return await e.env.DB.prepare(`
      UPDATE notifications SET is_read = 1 WHERE id = ?
    `).bind(r).run(),e.json({success:!0})}catch(r){return console.error("Mark notification read error:",r),e.json({error:"Failed to mark notification as read"},500)}});f.get("/api/notifications/:userId/unread-count",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `).bind(r).first();return e.json({success:!0,count:(t==null?void 0:t.count)||0})}catch(r){return console.error("Get unread count error:",r),e.json({error:"Failed to get unread count"},500)}});f.get("/api/notifications/:userId/unread",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(r).all();return e.json({success:!0,notifications:t||[]})}catch(r){return console.error("Get unread notifications error:",r),e.json({error:"Failed to get unread notifications"},500)}});f.get("/api/data/plans",async e=>{try{const r=e.req.query("network");let t="SELECT * FROM data_plans WHERE active = 1";const s=[];r&&(t+=" AND network = ?",s.push(r)),t+=" ORDER BY token_cost ASC";const n=await e.env.DB.prepare(t).bind(...s).all();return e.json({success:!0,data:n.results||[]})}catch(r){return console.error("Get data plans error:",r),e.json({error:"Failed to get data plans"},500)}});f.post("/api/data/redeem",async e=>{var r,t,s,n,a,o,i;try{const{userId:c,planCode:d,phoneNumber:u}=await e.req.json();if(!c||!d||!u)return e.json({error:"User ID, plan code, and phone number required"},400);if(!/^0[789][01]\d{8}$/.test(u))return e.json({error:"Invalid Nigerian phone number format"},400);const m=await e.env.DB.prepare(`
      SELECT * FROM data_plans WHERE plan_code = ? AND active = 1
    `).bind(d).first();if(!m)return e.json({error:"Data plan not found"},404);const h=await e.env.DB.prepare(`
      SELECT tokens, email, phone_number FROM users WHERE id = ?
    `).bind(c).first();if(!h)return e.json({error:"User not found"},404);if(h.tokens<m.token_cost)return e.json({error:"Insufficient tokens",required:m.token_cost,current:h.tokens},400);const b=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO data_redemptions (
        user_id, phone_number, network, data_plan, 
        data_amount, token_cost, status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(c,u,m.network,m.plan_code,m.data_amount,m.token_cost,b).run(),await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens - ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `).bind(m.token_cost,m.token_cost,c).run();let y="pending",_=null,R=null;const k=e.env.VTPASS_API_KEY,D=e.env.VTPASS_PUBLIC_KEY,x=e.env.VTPASS_SECRET_KEY,T=e.env.VTPASS_BASE_URL||"https://sandbox.vtpass.com/api";if(k&&D&&x)try{const U={MTN:"mtn-data",Airtel:"airtel-data",Glo:"glo-data","9mobile":"etisalat-data"}[m.network]||"mtn-data",N=`SCPAY-${Date.now()}-${Math.floor(Math.random()*1e4)}`;console.log(`[VTPASS] Purchasing ${m.data_amount} ${m.network} data for ${u}`);const L=await fetch(`${T}/pay`,{method:"POST",headers:{"api-key":k,"secret-key":x,"Content-Type":"application/json"},body:JSON.stringify({request_id:N,serviceID:U,billersCode:u,variation_code:m.plan_code,amount:parseInt(m.variation_amount||"0"),phone:u})});if(!L.ok)throw new Error(`VTPass API error: ${L.status} ${L.statusText}`);const A=await L.json();console.log(`[VTPASS] Response code: ${A.code}, status: ${(t=(r=A.content)==null?void 0:r.transactions)==null?void 0:t.status}`);const H=(a=(n=(s=A.content)==null?void 0:s.transactions)==null?void 0:n.status)==null?void 0:a.toLowerCase();H==="delivered"||H==="successful"?y="completed":H==="failed"||H==="reversed"?(y="failed",R=A.response_description||"Transaction failed"):y="pending",_=((i=(o=A.content)==null?void 0:o.transactions)==null?void 0:i.transactionId)||N,console.log(`[VTPASS] Transaction ${b} status: ${y}`)}catch(ee){console.error("[VTPASS] API error:",ee),y="failed",R=ee.message||"VTPass API error",await e.env.DB.prepare(`
          UPDATE users 
          SET tokens = tokens + ?,
              total_spent = total_spent - ?
          WHERE id = ?
        `).bind(m.token_cost,m.token_cost,c).run(),console.log(`[VTPASS] Refunded ${m.token_cost} tokens to user ${c} due to API error`)}else console.log("[DATA REDEMPTION] DEMO MODE - VTPass API keys not configured"),y="completed",_="DEMO-"+Date.now();await e.env.DB.prepare(`
      UPDATE data_redemptions 
      SET status = ?,
          api_reference = ?,
          error_message = ?,
          completed_at = ?
      WHERE transaction_id = ?
    `).bind(y,_,R,y!=="pending"?new Date().toISOString():null,b).run(),console.log(`[DATA REDEMPTION] User ${c} redeemed ${m.data_amount} ${m.network} data for ${m.token_cost} tokens`),await e.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'data_redeemed', 'Data Redeemed!', ?)
    `).bind(c,`${m.data_amount} ${m.network} data sent to ${u}`).run();const Z=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(c).first();return e.json({success:!0,transactionId:b,message:`${m.data_amount} data will be sent to ${u} shortly`,newBalance:(Z==null?void 0:Z.tokens)||0,redemption:{network:m.network,dataAmount:m.data_amount,phoneNumber:u,status:y}})}catch(c){return console.error("Data redemption error:",c),e.json({error:"Failed to redeem data"},500)}});f.get("/api/data/history/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"20"),s=await e.env.DB.prepare(`
      SELECT 
        id, phone_number, network, data_amount, 
        token_cost, status, transaction_id, created_at
      FROM data_redemptions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,history:s.results||[]})}catch(r){return console.error("Get redemption history error:",r),e.json({error:"Failed to get history"},500)}});f.get("/api/data/status/:transactionId",async e=>{try{const r=e.req.param("transactionId"),t=await e.env.DB.prepare(`
      SELECT * FROM data_redemptions WHERE transaction_id = ?
    `).bind(r).first();return t?e.json({success:!0,status:t.status,details:t}):e.json({error:"Transaction not found"},404)}catch(r){return console.error("Get redemption status error:",r),e.json({error:"Failed to get status"},500)}});f.post("/api/ads/register-advertiser",async e=>{try{const{businessName:r,email:t,phone:s,instagramHandle:n,websiteUrl:a}=await e.req.json();if(!r||!t)return e.json({error:"Business name and email required"},400);if(await e.env.DB.prepare(`
      SELECT id FROM advertisers WHERE email = ?
    `).bind(t).first())return e.json({error:"Email already registered"},409);const i=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO advertisers (id, business_name, email, phone, instagram_handle, website_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(i,r,t,s||null,n||null,a||null).run(),console.log(`[ADS] Advertiser registered: ${r}`),e.json({success:!0,advertiserId:i,message:"Advertiser registered successfully"})}catch(r){return console.error("[ADS] Registration error:",r),e.json({error:"Registration failed"},500)}});f.post("/api/ads/login-advertiser",async e=>{try{const{email:r}=await e.req.json();if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id, business_name, email, phone, instagram_handle, website_url, created_at
      FROM advertisers WHERE email = ?
    `).bind(r).first();return t?(console.log(`[ADS] Advertiser logged in: ${r}`),e.json({success:!0,advertiserId:t.id,businessName:t.business_name,email:t.email,phone:t.phone,instagramHandle:t.instagram_handle,websiteUrl:t.website_url,message:"Login successful"})):e.json({error:"Account not found. Please register first."},404)}catch(r){return console.error("[ADS] Login error:",r),e.json({error:"Login failed"},500)}});f.post("/api/ads/create-campaign",async e=>{try{const{advertiserId:r,campaignName:t,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:c,pricingModel:d,budgetTotal:u,startDate:p,endDate:m}=await e.req.json();if(!r||!t||!s||!n||!o||!d||!u)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!c)return e.json({error:"Website URL required for website destination"},400);if(u<2e3)return e.json({error:"Minimum budget is ₦2,000"},400);const h=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO ad_campaigns (
        id, advertiser_id, campaign_name, 
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(h,r,t,s,n,a||null,o,i||null,c||null,d,u,p||new Date().toISOString(),m||null).run(),console.log(`[ADS] Campaign created: ${t} by advertiser ${r}`),e.json({success:!0,campaignId:h,message:"Campaign created and activated!",status:"active"})}catch(r){return console.error("[ADS] Campaign creation error:",r),e.json({error:"Campaign creation failed"},500)}});f.put("/api/ads/update-campaign/:campaignId",async e=>{try{const r=e.req.param("campaignId"),{campaignName:t,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:c,budgetTotal:d}=await e.req.json(),u=await e.env.DB.prepare(`
      SELECT id, advertiser_id, budget_spent FROM ad_campaigns WHERE id = ?
    `).bind(r).first();if(!u)return e.json({error:"Campaign not found"},404);if(!t||!s||!n||!o)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!c)return e.json({error:"Website URL required for website destination"},400);if(d&&d<u.budget_spent)return e.json({error:`Budget cannot be less than already spent (₦${u.budget_spent})`},400);const p=[],m=[];return t&&(p.push("campaign_name = ?"),m.push(t)),s&&(p.push("ad_image_url = ?"),m.push(s)),n&&(p.push("ad_title = ?"),m.push(n)),a!==void 0&&(p.push("ad_description = ?"),m.push(a||null)),o&&(p.push("destination_type = ?"),m.push(o)),i!==void 0&&(p.push("instagram_handle = ?"),m.push(i||null)),c!==void 0&&(p.push("website_url = ?"),m.push(c||null)),d&&(p.push("budget_total = ?"),m.push(d)),m.push(r),await e.env.DB.prepare(`
      UPDATE ad_campaigns 
      SET ${p.join(", ")}
      WHERE id = ?
    `).bind(...m).run(),console.log(`[ADS] Campaign updated: ${r}`),e.json({success:!0,campaignId:r,message:"Campaign updated successfully!"})}catch(r){return console.error("[ADS] Campaign update error:",r),e.json({error:"Campaign update failed"},500)}});f.post("/api/ads/campaign/:campaignId/status",async e=>{try{const r=e.req.param("campaignId"),{status:t}=await e.req.json();return["active","paused"].includes(t)?await e.env.DB.prepare(`
      SELECT id, campaign_name FROM ad_campaigns WHERE id = ?
    `).bind(r).first()?(await e.env.DB.prepare(`
      UPDATE ad_campaigns SET status = ? WHERE id = ?
    `).bind(t,r).run(),console.log(`[ADS] Campaign ${t}: ${r}`),e.json({success:!0,campaignId:r,status:t,message:`Campaign ${t==="active"?"resumed":"paused"} successfully!`})):e.json({error:"Campaign not found"},404):e.json({error:'Invalid status. Use "active" or "paused"'},400)}catch(r){return console.error("[ADS] Campaign status update error:",r),e.json({error:"Status update failed"},500)}});f.get("/api/ads/campaign/:campaignId",async e=>{try{const r=e.req.param("campaignId"),t=await e.env.DB.prepare(`
      SELECT 
        id, advertiser_id, campaign_name,
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total, budget_spent,
        impressions, clicks, status,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,campaign:t}):e.json({error:"Campaign not found"},404)}catch(r){return console.error("[ADS] Get campaign error:",r),e.json({error:"Failed to fetch campaign"},500)}});f.get("/api/ads/active",async e=>{try{const r=e.req.query("userId"),t=await e.env.DB.prepare(`
      SELECT 
        id, ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, impressions, clicks
      FROM ad_campaigns
      WHERE status = 'active'
        AND budget_spent < budget_total
      ORDER BY RANDOM()
      LIMIT 1
    `).first();return t?e.json({success:!0,ad:t}):e.json({success:!0,ad:null,message:"No active ads"})}catch(r){return console.error("[ADS] Get active ads error:",r),e.json({error:"Failed to get ads"},500)}});f.post("/api/ads/impression",async e=>{try{const{campaignId:r,userId:t,sessionId:s}=await e.req.json();if(!r)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
      SELECT id, pricing_model, cpm_rate, budget_total, budget_spent, impressions
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(r).first();if(!n)return e.json({error:"Campaign not found or inactive"},404);let a=0;n.pricing_model==="cpm"&&(a=(n.cpm_rate||200)/1e3);const o=(n.budget_spent||0)+a,i=(n.impressions||0)+1;return o>n.budget_total?(await e.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(r).run(),e.json({success:!0,message:"Campaign budget depleted",campaignCompleted:!0})):(await e.env.DB.prepare(`
      INSERT INTO ad_impressions (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(r,t||null,s||null).run(),await e.env.DB.prepare(`
      UPDATE ad_campaigns
      SET impressions = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(i,o,r).run(),e.json({success:!0,impressionRecorded:!0}))}catch(r){return console.error("[ADS] Impression tracking error:",r),e.json({error:"Failed to track impression"},500)}});f.post("/api/ads/click",async e=>{try{const{campaignId:r,userId:t,sessionId:s}=await e.req.json();if(!r)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
      SELECT id, pricing_model, cpc_rate, budget_total, budget_spent, clicks,
             destination_type, instagram_handle, website_url
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(r).first();if(!n)return e.json({error:"Campaign not found or inactive"},404);let a=0;n.pricing_model==="cpc"&&(a=n.cpc_rate||10);const o=(n.budget_spent||0)+a,i=(n.clicks||0)+1;o>n.budget_total&&await e.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(r).run(),await e.env.DB.prepare(`
      INSERT INTO ad_clicks (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(r,t||null,s||null).run(),await e.env.DB.prepare(`
      UPDATE ad_campaigns
      SET clicks = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(i,o,r).run();let c="";return n.destination_type==="instagram"?c=`https://instagram.com/${n.instagram_handle}`:c=n.website_url,e.json({success:!0,clickRecorded:!0,destinationUrl:c})}catch(r){return console.error("[ADS] Click tracking error:",r),e.json({error:"Failed to track click"},500)}});f.get("/api/ads/campaign/:campaignId/analytics",async e=>{try{const r=e.req.param("campaignId"),t=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        pricing_model, cpm_rate, cpc_rate,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(r).first();if(!t)return e.json({error:"Campaign not found"},404);const s=t.impressions>0?(t.clicks/t.impressions*100).toFixed(2):0,n=t.clicks>0?(t.budget_spent/t.clicks).toFixed(2):0,a=t.budget_total-t.budget_spent,o=(t.budget_spent/t.budget_total*100).toFixed(1);return e.json({success:!0,campaign:{...t,metrics:{ctr:`${s}%`,avgCostPerClick:`₦${n}`,budgetRemaining:`₦${a.toFixed(2)}`,percentSpent:`${o}%`}}})}catch(r){return console.error("[ADS] Analytics error:",r),e.json({error:"Failed to get analytics"},500)}});f.get("/api/ads/advertiser/:advertiserId/campaigns",async e=>{try{const r=e.req.param("advertiserId"),t=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE advertiser_id = ?
      ORDER BY created_at DESC
    `).bind(r).all();return e.json({success:!0,campaigns:t.results||[]})}catch(r){return console.error("[ADS] Get campaigns error:",r),e.json({error:"Failed to get campaigns"},500)}});f.post("/api/contacts/request",async e=>{try{const r=e.req.header("X-User-Email"),{contact_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and contact ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!s)return e.json({error:"User not found"},404);const n=await e.env.DB.prepare(`
      SELECT status FROM user_contacts 
      WHERE user_id = ? AND contact_user_id = ?
    `).bind(s.id,t).first();if(n){if(n.status==="accepted")return e.json({error:"Already contacts"},400);if(n.status==="pending")return e.json({error:"Contact request already sent"},400);if(n.status==="blocked")return e.json({error:"Cannot send contact request"},403)}await e.env.DB.prepare(`
      INSERT INTO user_contacts (user_id, contact_user_id, status, created_at)
      VALUES (?, ?, 'pending', datetime('now'))
    `).bind(s.id,t).run();const a=await e.env.DB.prepare(`
      SELECT username FROM users WHERE id = ?
    `).bind(s.id).first();return await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(crypto.randomUUID(),t,"contact_request","New Contact Request",`${(a==null?void 0:a.username)||"Someone"} wants to connect with you`).run(),console.log(`[CONTACTS] Request sent from ${s.id} to ${t}`),e.json({success:!0,message:"Contact request sent"})}catch(r){return console.error("[CONTACTS] Request error:",r),e.json({error:"Failed to send contact request"},500)}});f.post("/api/contacts/accept",async e=>{try{const r=e.req.header("X-User-Email"),{requester_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and requester ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!s)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
      UPDATE user_contacts SET status = 'accepted', created_at = datetime('now')
      WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,s.id).run(),await e.env.DB.prepare(`
      INSERT OR REPLACE INTO user_contacts (user_id, contact_user_id, status, created_at)
      VALUES (?, ?, 'accepted', datetime('now'))
    `).bind(s.id,t).run();const n=await e.env.DB.prepare(`
      SELECT username FROM users WHERE id = ?
    `).bind(s.id).first();return await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(crypto.randomUUID(),t,"contact_accepted","Contact Request Accepted",`${(n==null?void 0:n.username)||"Someone"} accepted your contact request`).run(),console.log(`[CONTACTS] Request accepted: ${t} <-> ${s.id}`),e.json({success:!0,message:"Contact request accepted"})}catch(r){return console.error("[CONTACTS] Accept error:",r),e.json({error:"Failed to accept contact request"},500)}});f.post("/api/contacts/reject",async e=>{try{const r=e.req.header("X-User-Email"),{requester_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and requester ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,s.id).run(),console.log(`[CONTACTS] Request rejected: ${t} -> ${s.id}`),e.json({success:!0,message:"Contact request rejected"})):e.json({error:"User not found"},404)}catch(r){return console.error("[CONTACTS] Reject error:",r),e.json({error:"Failed to reject contact request"},500)}});f.get("/api/contacts/requests",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"User email required"},400);const t=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, uc.created_at
      FROM user_contacts uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.contact_user_id = ? AND uc.status = 'pending'
      ORDER BY uc.created_at DESC
    `).bind(t.id).all();return e.json({requests:s.results||[]})}catch(r){return console.error("[CONTACTS] Get requests error:",r),e.json({error:"Failed to get contact requests"},500)}});f.get("/api/contacts",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"User email required"},400);const t=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.online_status, u.last_seen
      FROM user_contacts uc
      JOIN users u ON uc.contact_user_id = u.id
      WHERE uc.user_id = ? AND uc.status = 'accepted'
      ORDER BY u.username ASC
    `).bind(t.id).all();return e.json({contacts:s.results||[]})}catch(r){return console.error("[CONTACTS] Get contacts error:",r),e.json({error:"Failed to get contacts"},500)}});f.delete("/api/contacts/:contactId",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("contactId");if(!r||!t)return e.json({error:"User email and contact ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(s.id,t).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,s.id).run(),console.log(`[CONTACTS] Removed contact: ${s.id} <-> ${t}`),e.json({success:!0,message:"Contact removed"})):e.json({error:"User not found"},404)}catch(r){return console.error("[CONTACTS] Remove error:",r),e.json({error:"Failed to remove contact"},500)}});f.post("/api/users/block",async e=>{try{const r=e.req.header("X-User-Email"),{user_id:t,reason:s}=await e.req.json();if(!r||!t)return e.json({error:"User email and target user ID required"},400);const n=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return n?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO blocked_users (user_id, blocked_user_id, blocked_at, reason)
      VALUES (?, ?, datetime('now'), ?)
    `).bind(n.id,t,s||null).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(n.id,t).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,n.id).run(),console.log(`[BLOCK] User ${n.id} blocked ${t}`),e.json({success:!0,message:"User blocked"})):e.json({error:"User not found"},404)}catch(r){return console.error("[BLOCK] Block error:",r),e.json({error:"Failed to block user"},500)}});f.delete("/api/users/block/:userId",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("userId");if(!r||!t)return e.json({error:"User email and blocked user ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM blocked_users WHERE user_id = ? AND blocked_user_id = ?
    `).bind(s.id,t).run(),console.log(`[BLOCK] User ${s.id} unblocked ${t}`),e.json({success:!0,message:"User unblocked"})):e.json({error:"User not found"},404)}catch(r){return console.error("[BLOCK] Unblock error:",r),e.json({error:"Failed to unblock user"},500)}});f.post("/api/users/status",async e=>{try{const r=e.req.header("X-User-Email"),{status:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and status required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      UPDATE users 
      SET online_status = ?, last_seen = datetime('now')
      WHERE id = ?
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[STATUS] Update error:",r),e.json({error:"Failed to update status"},500)}});f.get("/api/rooms/:roomId/online",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, u.online_status
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ? 
        AND u.online_status = 'online'
        AND u.last_seen >= datetime('now', '-2 minutes')
      ORDER BY u.username
    `).bind(r).all();return e.json({online:t.results||[]})}catch(r){return console.error("[STATUS] Get online error:",r),e.json({error:"Failed to get online users"},500)}});f.post("/api/typing/start",async e=>{try{const r=e.req.header("X-User-Email"),{room_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and room ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO typing_status (room_id, user_id, started_at)
      VALUES (?, ?, datetime('now'))
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[TYPING] Start error:",r),e.json({error:"Failed to start typing"},500)}});f.post("/api/typing/stop",async e=>{try{const r=e.req.header("X-User-Email"),{room_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and room ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM typing_status WHERE room_id = ? AND user_id = ?
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[TYPING] Stop error:",r),e.json({error:"Failed to stop typing"},500)}});f.get("/api/typing/:roomId",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar
      FROM typing_status ts
      JOIN users u ON ts.user_id = u.id
      WHERE ts.room_id = ? AND ts.started_at >= datetime('now', '-5 seconds')
    `).bind(r).all();return e.json({typing:t.results||[]})}catch(r){return console.error("[TYPING] Get error:",r),e.json({error:"Failed to get typing users"},500)}});f.post("/api/messages/:messageId/read",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("messageId");if(!r||!t)return e.json({error:"User email and message ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO message_receipts (message_id, user_id, read_at)
      VALUES (?, ?, datetime('now'))
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[RECEIPTS] Mark read error:",r),e.json({error:"Failed to mark message as read"},500)}});f.get("/api/messages/:messageId/receipts",async e=>{try{const r=e.req.param("messageId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, mr.read_at
      FROM message_receipts mr
      JOIN users u ON mr.user_id = u.id
      WHERE mr.message_id = ?
      ORDER BY mr.read_at ASC
    `).bind(r).all();return e.json({receipts:t.results||[]})}catch(r){return console.error("[RECEIPTS] Get receipts error:",r),e.json({error:"Failed to get read receipts"},500)}});f.get("*",e=>e.req.path.startsWith("/api/")||e.req.path.startsWith("/static/")?e.notFound():e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amebo - 🇳🇬 Earn Tokens · Buy Data</title>
        <link rel="icon" type="image/png" href="/static/amebo-logo.png">
        <link rel="apple-touch-icon" href="/static/amebo-logo.png">
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script src="/static/crypto-v2.js"><\/script>
        <script src="/static/app-v3.js?v=20251220-v8"><\/script>
        <script>
            const app = new SecureChatApp();
            app.init();
        <\/script>
    </body>
    </html>
  `));const ze=new _r,wt=Object.assign({"/src/index.tsx":f});let Rr=!1;for(const[,e]of Object.entries(wt))e&&(ze.all("*",r=>{let t;try{t=r.executionCtx}catch{}return e.fetch(r.req.raw,r.env,t)}),ze.notFound(r=>{let t;try{t=r.executionCtx}catch{}return e.fetch(r.req.raw,r.env,t)}),Rr=!0);if(!Rr)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{ze as default};
