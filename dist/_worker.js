var Tr=Object.defineProperty;var We=e=>{throw TypeError(e)};var Sr=(e,r,t)=>r in e?Tr(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t;var g=(e,r,t)=>Sr(e,typeof r!="symbol"?r+"":r,t),Pe=(e,r,t)=>r.has(e)||We("Cannot "+t);var l=(e,r,t)=>(Pe(e,r,"read from private field"),t?t.call(e):r.get(e)),b=(e,r,t)=>r.has(e)?We("Cannot add the same private member more than once"):r instanceof WeakSet?r.add(e):r.set(e,t),h=(e,r,t,s)=>(Pe(e,r,"write to private field"),s?s.call(e,t):r.set(e,t),t),v=(e,r,t)=>(Pe(e,r,"access private method"),t);var Ve=(e,r,t,s)=>({set _(n){h(e,r,n,t)},get _(){return l(e,r,s)}});var Ye=(e,r,t)=>(s,n)=>{let a=-1;return o(0);async function o(i){if(i<=a)throw new Error("next() called multiple times");a=i;let d,u=!1,c;if(e[i]?(c=e[i][0][0],s.req.routeIndex=i):c=i===e.length&&n||void 0,c)try{d=await c(s,()=>o(i+1))}catch(m){if(m instanceof Error&&r)s.error=m,d=await r(m,s),u=!0;else throw m}else s.finalized===!1&&t&&(d=await t(s));return d&&(s.finalized===!1||u)&&(s.res=d),s}},Dr=Symbol(),jr=async(e,r=Object.create(null))=>{const{all:t=!1,dot:s=!1}=r,a=(e instanceof dr?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?Ar(e,{all:t,dot:s}):{}};async function Ar(e,r){const t=await e.formData();return t?Or(t,r):{}}function Or(e,r){const t=Object.create(null);return e.forEach((s,n)=>{r.all||n.endsWith("[]")?kr(t,n,s):t[n]=s}),r.dot&&Object.entries(t).forEach(([s,n])=>{s.includes(".")&&(Cr(t,s,n),delete t[s])}),t}var kr=(e,r,t)=>{e[r]!==void 0?Array.isArray(e[r])?e[r].push(t):e[r]=[e[r],t]:r.endsWith("[]")?e[r]=[t]:e[r]=t},Cr=(e,r,t)=>{let s=e;const n=r.split(".");n.forEach((a,o)=>{o===n.length-1?s[a]=t:((!s[a]||typeof s[a]!="object"||Array.isArray(s[a])||s[a]instanceof File)&&(s[a]=Object.create(null)),s=s[a])})},sr=e=>{const r=e.split("/");return r[0]===""&&r.shift(),r},Nr=e=>{const{groups:r,path:t}=Ur(e),s=sr(t);return Lr(s,r)},Ur=e=>{const r=[];return e=e.replace(/\{[^}]+\}/g,(t,s)=>{const n=`@${s}`;return r.push([n,t]),n}),{groups:r,path:e}},Lr=(e,r)=>{for(let t=r.length-1;t>=0;t--){const[s]=r[t];for(let n=e.length-1;n>=0;n--)if(e[n].includes(s)){e[n]=e[n].replace(s,r[t][1]);break}}return e},Oe={},xr=(e,r)=>{if(e==="*")return"*";const t=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(t){const s=`${e}#${r}`;return Oe[s]||(t[2]?Oe[s]=r&&r[0]!==":"&&r[0]!=="*"?[s,t[1],new RegExp(`^${t[2]}(?=/${r})`)]:[e,t[1],new RegExp(`^${t[2]}$`)]:Oe[s]=[e,t[1],!0]),Oe[s]}return null},$e=(e,r)=>{try{return r(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,t=>{try{return r(t)}catch{return t}})}},Fr=e=>$e(e,decodeURI),nr=e=>{const r=e.url,t=r.indexOf("/",r.indexOf(":")+4);let s=t;for(;s<r.length;s++){const n=r.charCodeAt(s);if(n===37){const a=r.indexOf("?",s),o=r.slice(t,a===-1?void 0:a);return Fr(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return r.slice(t,s)},Pr=e=>{const r=nr(e);return r.length>1&&r.at(-1)==="/"?r.slice(0,-1):r},le=(e,r,...t)=>(t.length&&(r=le(r,...t)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${r==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(r==null?void 0:r[0])==="/"?r.slice(1):r}`}`),ar=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const r=e.split("/"),t=[];let s="";return r.forEach(n=>{if(n!==""&&!/\:/.test(n))s+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){t.length===0&&s===""?t.push("/"):t.push(s);const a=n.replace("?","");s+="/"+a,t.push(s)}else s+="/"+n}),t.filter((n,a,o)=>o.indexOf(n)===a)},Me=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?$e(e,ir):e):e,or=(e,r,t)=>{let s;if(!t&&r&&!/[%+]/.test(r)){let o=e.indexOf("?",8);if(o===-1)return;for(e.startsWith(r,o+1)||(o=e.indexOf(`&${r}`,o+1));o!==-1;){const i=e.charCodeAt(o+r.length+1);if(i===61){const d=o+r.length+2,u=e.indexOf("&",d);return Me(e.slice(d,u===-1?void 0:u))}else if(i==38||isNaN(i))return"";o=e.indexOf(`&${r}`,o+1)}if(s=/[%+]/.test(e),!s)return}const n={};s??(s=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const o=e.indexOf("&",a+1);let i=e.indexOf("=",a);i>o&&o!==-1&&(i=-1);let d=e.slice(a+1,i===-1?o===-1?void 0:o:i);if(s&&(d=Me(d)),a=o,d==="")continue;let u;i===-1?u="":(u=e.slice(i+1,o===-1?void 0:o),s&&(u=Me(u))),t?(n[d]&&Array.isArray(n[d])||(n[d]=[]),n[d].push(u)):n[d]??(n[d]=u)}return r?n[r]:n},Mr=or,Br=(e,r)=>or(e,r,!0),ir=decodeURIComponent,Ge=e=>$e(e,ir),fe,F,Y,ur,cr,He,G,Xe,dr=(Xe=class{constructor(e,r="/",t=[[]]){b(this,Y);g(this,"raw");b(this,fe);b(this,F);g(this,"routeIndex",0);g(this,"path");g(this,"bodyCache",{});b(this,G,e=>{const{bodyCache:r,raw:t}=this,s=r[e];if(s)return s;const n=Object.keys(r)[0];return n?r[n].then(a=>(n==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):r[e]=t[e]()});this.raw=e,this.path=r,h(this,F,t),h(this,fe,{})}param(e){return e?v(this,Y,ur).call(this,e):v(this,Y,cr).call(this)}query(e){return Mr(this.url,e)}queries(e){return Br(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const r={};return this.raw.headers.forEach((t,s)=>{r[s]=t}),r}async parseBody(e){var r;return(r=this.bodyCache).parsedBody??(r.parsedBody=await jr(this,e))}json(){return l(this,G).call(this,"text").then(e=>JSON.parse(e))}text(){return l(this,G).call(this,"text")}arrayBuffer(){return l(this,G).call(this,"arrayBuffer")}blob(){return l(this,G).call(this,"blob")}formData(){return l(this,G).call(this,"formData")}addValidatedData(e,r){l(this,fe)[e]=r}valid(e){return l(this,fe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Dr](){return l(this,F)}get matchedRoutes(){return l(this,F)[0].map(([[,e]])=>e)}get routePath(){return l(this,F)[0].map(([[,e]])=>e)[this.routeIndex].path}},fe=new WeakMap,F=new WeakMap,Y=new WeakSet,ur=function(e){const r=l(this,F)[0][this.routeIndex][1][e],t=v(this,Y,He).call(this,r);return t&&/\%/.test(t)?Ge(t):t},cr=function(){const e={},r=Object.keys(l(this,F)[0][this.routeIndex][1]);for(const t of r){const s=v(this,Y,He).call(this,l(this,F)[0][this.routeIndex][1][t]);s!==void 0&&(e[t]=/\%/.test(s)?Ge(s):s)}return e},He=function(e){return l(this,F)[1]?l(this,F)[1][e]:e},G=new WeakMap,Xe),Hr={Stringify:1},lr=async(e,r,t,s,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(n?n[0]+=e:n=[e],Promise.all(a.map(i=>i({phase:r,buffer:n,context:s}))).then(i=>Promise.all(i.filter(Boolean).map(d=>lr(d,r,!1,s,n))).then(()=>n[0]))):Promise.resolve(e)},qr="text/plain; charset=UTF-8",Be=(e,r)=>({"Content-Type":e,...r}),Ie,Te,q,Ee,$,C,Se,he,ge,se,De,je,K,pe,Qe,$r=(Qe=class{constructor(e,r){b(this,K);b(this,Ie);b(this,Te);g(this,"env",{});b(this,q);g(this,"finalized",!1);g(this,"error");b(this,Ee);b(this,$);b(this,C);b(this,Se);b(this,he);b(this,ge);b(this,se);b(this,De);b(this,je);g(this,"render",(...e)=>(l(this,he)??h(this,he,r=>this.html(r)),l(this,he).call(this,...e)));g(this,"setLayout",e=>h(this,Se,e));g(this,"getLayout",()=>l(this,Se));g(this,"setRenderer",e=>{h(this,he,e)});g(this,"header",(e,r,t)=>{this.finalized&&h(this,C,new Response(l(this,C).body,l(this,C)));const s=l(this,C)?l(this,C).headers:l(this,se)??h(this,se,new Headers);r===void 0?s.delete(e):t!=null&&t.append?s.append(e,r):s.set(e,r)});g(this,"status",e=>{h(this,Ee,e)});g(this,"set",(e,r)=>{l(this,q)??h(this,q,new Map),l(this,q).set(e,r)});g(this,"get",e=>l(this,q)?l(this,q).get(e):void 0);g(this,"newResponse",(...e)=>v(this,K,pe).call(this,...e));g(this,"body",(e,r,t)=>v(this,K,pe).call(this,e,r,t));g(this,"text",(e,r,t)=>!l(this,se)&&!l(this,Ee)&&!r&&!t&&!this.finalized?new Response(e):v(this,K,pe).call(this,e,r,Be(qr,t)));g(this,"json",(e,r,t)=>v(this,K,pe).call(this,JSON.stringify(e),r,Be("application/json",t)));g(this,"html",(e,r,t)=>{const s=n=>v(this,K,pe).call(this,n,r,Be("text/html; charset=UTF-8",t));return typeof e=="object"?lr(e,Hr.Stringify,!1,{}).then(s):s(e)});g(this,"redirect",(e,r)=>{const t=String(e);return this.header("Location",/[^\x00-\xFF]/.test(t)?encodeURI(t):t),this.newResponse(null,r??302)});g(this,"notFound",()=>(l(this,ge)??h(this,ge,()=>new Response),l(this,ge).call(this,this)));h(this,Ie,e),r&&(h(this,$,r.executionCtx),this.env=r.env,h(this,ge,r.notFoundHandler),h(this,je,r.path),h(this,De,r.matchResult))}get req(){return l(this,Te)??h(this,Te,new dr(l(this,Ie),l(this,je),l(this,De))),l(this,Te)}get event(){if(l(this,$)&&"respondWith"in l(this,$))return l(this,$);throw Error("This context has no FetchEvent")}get executionCtx(){if(l(this,$))return l(this,$);throw Error("This context has no ExecutionContext")}get res(){return l(this,C)||h(this,C,new Response(null,{headers:l(this,se)??h(this,se,new Headers)}))}set res(e){if(l(this,C)&&e){e=new Response(e.body,e);for(const[r,t]of l(this,C).headers.entries())if(r!=="content-type")if(r==="set-cookie"){const s=l(this,C).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of s)e.headers.append("set-cookie",n)}else e.headers.set(r,t)}h(this,C,e),this.finalized=!0}get var(){return l(this,q)?Object.fromEntries(l(this,q)):{}}},Ie=new WeakMap,Te=new WeakMap,q=new WeakMap,Ee=new WeakMap,$=new WeakMap,C=new WeakMap,Se=new WeakMap,he=new WeakMap,ge=new WeakMap,se=new WeakMap,De=new WeakMap,je=new WeakMap,K=new WeakSet,pe=function(e,r,t){const s=l(this,C)?new Headers(l(this,C).headers):l(this,se)??new Headers;if(typeof r=="object"&&"headers"in r){const a=r.headers instanceof Headers?r.headers:new Headers(r.headers);for(const[o,i]of a)o.toLowerCase()==="set-cookie"?s.append(o,i):s.set(o,i)}if(t)for(const[a,o]of Object.entries(t))if(typeof o=="string")s.set(a,o);else{s.delete(a);for(const i of o)s.append(a,i)}const n=typeof r=="number"?r:(r==null?void 0:r.status)??l(this,Ee);return new Response(e,{status:n,headers:s})},Qe),T="ALL",Wr="all",Vr=["get","post","put","delete","options","patch"],pr="Can not add a route since the matcher is already built.",mr=class extends Error{},Yr="__COMPOSED_HANDLER",Gr=e=>e.text("404 Not Found",404),Ke=(e,r)=>{if("getResponse"in e){const t=e.getResponse();return r.newResponse(t.body,t)}return console.error(e),r.text("Internal Server Error",500)},P,S,fr,M,re,ke,Ce,_e,Kr=(_e=class{constructor(r={}){b(this,S);g(this,"get");g(this,"post");g(this,"put");g(this,"delete");g(this,"options");g(this,"patch");g(this,"all");g(this,"on");g(this,"use");g(this,"router");g(this,"getPath");g(this,"_basePath","/");b(this,P,"/");g(this,"routes",[]);b(this,M,Gr);g(this,"errorHandler",Ke);g(this,"onError",r=>(this.errorHandler=r,this));g(this,"notFound",r=>(h(this,M,r),this));g(this,"fetch",(r,...t)=>v(this,S,Ce).call(this,r,t[1],t[0],r.method));g(this,"request",(r,t,s,n)=>r instanceof Request?this.fetch(t?new Request(r,t):r,s,n):(r=r.toString(),this.fetch(new Request(/^https?:\/\//.test(r)?r:`http://localhost${le("/",r)}`,t),s,n)));g(this,"fire",()=>{addEventListener("fetch",r=>{r.respondWith(v(this,S,Ce).call(this,r.request,r,void 0,r.request.method))})});[...Vr,Wr].forEach(a=>{this[a]=(o,...i)=>(typeof o=="string"?h(this,P,o):v(this,S,re).call(this,a,l(this,P),o),i.forEach(d=>{v(this,S,re).call(this,a,l(this,P),d)}),this)}),this.on=(a,o,...i)=>{for(const d of[o].flat()){h(this,P,d);for(const u of[a].flat())i.map(c=>{v(this,S,re).call(this,u.toUpperCase(),l(this,P),c)})}return this},this.use=(a,...o)=>(typeof a=="string"?h(this,P,a):(h(this,P,"*"),o.unshift(a)),o.forEach(i=>{v(this,S,re).call(this,T,l(this,P),i)}),this);const{strict:s,...n}=r;Object.assign(this,n),this.getPath=s??!0?r.getPath??nr:Pr}route(r,t){const s=this.basePath(r);return t.routes.map(n=>{var o;let a;t.errorHandler===Ke?a=n.handler:(a=async(i,d)=>(await Ye([],t.errorHandler)(i,()=>n.handler(i,d))).res,a[Yr]=n.handler),v(o=s,S,re).call(o,n.method,n.path,a)}),this}basePath(r){const t=v(this,S,fr).call(this);return t._basePath=le(this._basePath,r),t}mount(r,t,s){let n,a;s&&(typeof s=="function"?a=s:(a=s.optionHandler,s.replaceRequest===!1?n=d=>d:n=s.replaceRequest));const o=a?d=>{const u=a(d);return Array.isArray(u)?u:[u]}:d=>{let u;try{u=d.executionCtx}catch{}return[d.env,u]};n||(n=(()=>{const d=le(this._basePath,r),u=d==="/"?0:d.length;return c=>{const m=new URL(c.url);return m.pathname=m.pathname.slice(u)||"/",new Request(m,c)}})());const i=async(d,u)=>{const c=await t(n(d.req.raw),...o(d));if(c)return c;await u()};return v(this,S,re).call(this,T,le(r,"*"),i),this}},P=new WeakMap,S=new WeakSet,fr=function(){const r=new _e({router:this.router,getPath:this.getPath});return r.errorHandler=this.errorHandler,h(r,M,l(this,M)),r.routes=this.routes,r},M=new WeakMap,re=function(r,t,s){r=r.toUpperCase(),t=le(this._basePath,t);const n={basePath:this._basePath,path:t,method:r,handler:s};this.router.add(r,t,[s,n]),this.routes.push(n)},ke=function(r,t){if(r instanceof Error)return this.errorHandler(r,t);throw r},Ce=function(r,t,s,n){if(n==="HEAD")return(async()=>new Response(null,await v(this,S,Ce).call(this,r,t,s,"GET")))();const a=this.getPath(r,{env:s}),o=this.router.match(n,a),i=new $r(r,{path:a,matchResult:o,env:s,executionCtx:t,notFoundHandler:l(this,M)});if(o[0].length===1){let u;try{u=o[0][0][0][0](i,async()=>{i.res=await l(this,M).call(this,i)})}catch(c){return v(this,S,ke).call(this,c,i)}return u instanceof Promise?u.then(c=>c||(i.finalized?i.res:l(this,M).call(this,i))).catch(c=>v(this,S,ke).call(this,c,i)):u??l(this,M).call(this,i)}const d=Ye(o[0],this.errorHandler,l(this,M));return(async()=>{try{const u=await d(i);if(!u.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return u.res}catch(u){return v(this,S,ke).call(this,u,i)}})()},_e),Er=[];function Jr(e,r){const t=this.buildAllMatchers(),s=((n,a)=>{const o=t[n]||t[T],i=o[2][a];if(i)return i;const d=a.match(o[0]);if(!d)return[[],Er];const u=d.indexOf("",1);return[o[1][u],d]});return this.match=s,s(e,r)}var Ue="[^/]+",ve=".*",Re="(?:|/.*)",me=Symbol(),zr=new Set(".\\+*[^]$()");function Xr(e,r){return e.length===1?r.length===1?e<r?-1:1:-1:r.length===1||e===ve||e===Re?1:r===ve||r===Re?-1:e===Ue?1:r===Ue?-1:e.length===r.length?e<r?-1:1:r.length-e.length}var ne,ae,B,de,Qr=(de=class{constructor(){b(this,ne);b(this,ae);b(this,B,Object.create(null))}insert(r,t,s,n,a){if(r.length===0){if(l(this,ne)!==void 0)throw me;if(a)return;h(this,ne,t);return}const[o,...i]=r,d=o==="*"?i.length===0?["","",ve]:["","",Ue]:o==="/*"?["","",Re]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let u;if(d){const c=d[1];let m=d[2]||Ue;if(c&&d[2]&&(m===".*"||(m=m.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(m))))throw me;if(u=l(this,B)[m],!u){if(Object.keys(l(this,B)).some(f=>f!==ve&&f!==Re))throw me;if(a)return;u=l(this,B)[m]=new de,c!==""&&h(u,ae,n.varIndex++)}!a&&c!==""&&s.push([c,l(u,ae)])}else if(u=l(this,B)[o],!u){if(Object.keys(l(this,B)).some(c=>c.length>1&&c!==ve&&c!==Re))throw me;if(a)return;u=l(this,B)[o]=new de}u.insert(i,t,s,n,a)}buildRegExpStr(){const t=Object.keys(l(this,B)).sort(Xr).map(s=>{const n=l(this,B)[s];return(typeof l(n,ae)=="number"?`(${s})@${l(n,ae)}`:zr.has(s)?`\\${s}`:s)+n.buildRegExpStr()});return typeof l(this,ne)=="number"&&t.unshift(`#${l(this,ne)}`),t.length===0?"":t.length===1?t[0]:"(?:"+t.join("|")+")"}},ne=new WeakMap,ae=new WeakMap,B=new WeakMap,de),Le,Ae,Ze,Zr=(Ze=class{constructor(){b(this,Le,{varIndex:0});b(this,Ae,new Qr)}insert(e,r,t){const s=[],n=[];for(let o=0;;){let i=!1;if(e=e.replace(/\{[^}]+\}/g,d=>{const u=`@\\${o}`;return n[o]=[u,d],o++,i=!0,u}),!i)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[i]=n[o];for(let d=a.length-1;d>=0;d--)if(a[d].indexOf(i)!==-1){a[d]=a[d].replace(i,n[o][1]);break}}return l(this,Ae).insert(a,r,s,l(this,Le),t),s}buildRegExp(){let e=l(this,Ae).buildRegExpStr();if(e==="")return[/^$/,[],[]];let r=0;const t=[],s=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,a,o)=>a!==void 0?(t[++r]=Number(a),"$()"):(o!==void 0&&(s[Number(o)]=++r),"")),[new RegExp(`^${e}`),t,s]}},Le=new WeakMap,Ae=new WeakMap,Ze),et=[/^$/,[],Object.create(null)],Ne=Object.create(null);function hr(e){return Ne[e]??(Ne[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(r,t)=>t?`\\${t}`:"(?:|/.*)")}$`))}function rt(){Ne=Object.create(null)}function tt(e){var u;const r=new Zr,t=[];if(e.length===0)return et;const s=e.map(c=>[!/\*|\/:/.test(c[0]),...c]).sort(([c,m],[f,E])=>c?1:f?-1:m.length-E.length),n=Object.create(null);for(let c=0,m=-1,f=s.length;c<f;c++){const[E,_,w]=s[c];E?n[_]=[w.map(([R])=>[R,Object.create(null)]),Er]:m++;let y;try{y=r.insert(_,m,E)}catch(R){throw R===me?new mr(_):R}E||(t[m]=w.map(([R,k])=>{const D=Object.create(null);for(k-=1;k>=0;k--){const[U,I]=y[k];D[U]=I}return[R,D]}))}const[a,o,i]=r.buildRegExp();for(let c=0,m=t.length;c<m;c++)for(let f=0,E=t[c].length;f<E;f++){const _=(u=t[c][f])==null?void 0:u[1];if(!_)continue;const w=Object.keys(_);for(let y=0,R=w.length;y<R;y++)_[w[y]]=i[_[w[y]]]}const d=[];for(const c in o)d[c]=t[o[c]];return[a,d,n]}function ce(e,r){if(e){for(const t of Object.keys(e).sort((s,n)=>n.length-s.length))if(hr(t).test(r))return[...e[t]]}}var J,z,xe,gr,er,st=(er=class{constructor(){b(this,xe);g(this,"name","RegExpRouter");b(this,J);b(this,z);g(this,"match",Jr);h(this,J,{[T]:Object.create(null)}),h(this,z,{[T]:Object.create(null)})}add(e,r,t){var i;const s=l(this,J),n=l(this,z);if(!s||!n)throw new Error(pr);s[e]||[s,n].forEach(d=>{d[e]=Object.create(null),Object.keys(d[T]).forEach(u=>{d[e][u]=[...d[T][u]]})}),r==="/*"&&(r="*");const a=(r.match(/\/:/g)||[]).length;if(/\*$/.test(r)){const d=hr(r);e===T?Object.keys(s).forEach(u=>{var c;(c=s[u])[r]||(c[r]=ce(s[u],r)||ce(s[T],r)||[])}):(i=s[e])[r]||(i[r]=ce(s[e],r)||ce(s[T],r)||[]),Object.keys(s).forEach(u=>{(e===T||e===u)&&Object.keys(s[u]).forEach(c=>{d.test(c)&&s[u][c].push([t,a])})}),Object.keys(n).forEach(u=>{(e===T||e===u)&&Object.keys(n[u]).forEach(c=>d.test(c)&&n[u][c].push([t,a]))});return}const o=ar(r)||[r];for(let d=0,u=o.length;d<u;d++){const c=o[d];Object.keys(n).forEach(m=>{var f;(e===T||e===m)&&((f=n[m])[c]||(f[c]=[...ce(s[m],c)||ce(s[T],c)||[]]),n[m][c].push([t,a-u+d+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(l(this,z)).concat(Object.keys(l(this,J))).forEach(r=>{e[r]||(e[r]=v(this,xe,gr).call(this,r))}),h(this,J,h(this,z,void 0)),rt(),e}},J=new WeakMap,z=new WeakMap,xe=new WeakSet,gr=function(e){const r=[];let t=e===T;return[l(this,J),l(this,z)].forEach(s=>{const n=s[e]?Object.keys(s[e]).map(a=>[a,s[e][a]]):[];n.length!==0?(t||(t=!0),r.push(...n)):e!==T&&r.push(...Object.keys(s[T]).map(a=>[a,s[T][a]]))}),t?tt(r):null},er),X,W,rr,nt=(rr=class{constructor(e){g(this,"name","SmartRouter");b(this,X,[]);b(this,W,[]);h(this,X,e.routers)}add(e,r,t){if(!l(this,W))throw new Error(pr);l(this,W).push([e,r,t])}match(e,r){if(!l(this,W))throw new Error("Fatal error");const t=l(this,X),s=l(this,W),n=t.length;let a=0,o;for(;a<n;a++){const i=t[a];try{for(let d=0,u=s.length;d<u;d++)i.add(...s[d]);o=i.match(e,r)}catch(d){if(d instanceof mr)continue;throw d}this.match=i.match.bind(i),h(this,X,[i]),h(this,W,void 0);break}if(a===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(l(this,W)||l(this,X).length!==1)throw new Error("No active router has been determined yet.");return l(this,X)[0]}},X=new WeakMap,W=new WeakMap,rr),be=Object.create(null),Q,O,oe,ye,j,V,te,we,at=(we=class{constructor(r,t,s){b(this,V);b(this,Q);b(this,O);b(this,oe);b(this,ye,0);b(this,j,be);if(h(this,O,s||Object.create(null)),h(this,Q,[]),r&&t){const n=Object.create(null);n[r]={handler:t,possibleKeys:[],score:0},h(this,Q,[n])}h(this,oe,[])}insert(r,t,s){h(this,ye,++Ve(this,ye)._);let n=this;const a=Nr(t),o=[];for(let i=0,d=a.length;i<d;i++){const u=a[i],c=a[i+1],m=xr(u,c),f=Array.isArray(m)?m[0]:u;if(f in l(n,O)){n=l(n,O)[f],m&&o.push(m[1]);continue}l(n,O)[f]=new we,m&&(l(n,oe).push(m),o.push(m[1])),n=l(n,O)[f]}return l(n,Q).push({[r]:{handler:s,possibleKeys:o.filter((i,d,u)=>u.indexOf(i)===d),score:l(this,ye)}}),n}search(r,t){var d;const s=[];h(this,j,be);let a=[this];const o=sr(t),i=[];for(let u=0,c=o.length;u<c;u++){const m=o[u],f=u===c-1,E=[];for(let _=0,w=a.length;_<w;_++){const y=a[_],R=l(y,O)[m];R&&(h(R,j,l(y,j)),f?(l(R,O)["*"]&&s.push(...v(this,V,te).call(this,l(R,O)["*"],r,l(y,j))),s.push(...v(this,V,te).call(this,R,r,l(y,j)))):E.push(R));for(let k=0,D=l(y,oe).length;k<D;k++){const U=l(y,oe)[k],I=l(y,j)===be?{}:{...l(y,j)};if(U==="*"){const A=l(y,O)["*"];A&&(s.push(...v(this,V,te).call(this,A,r,l(y,j))),h(A,j,I),E.push(A));continue}const[Z,ee,L]=U;if(!m&&!(L instanceof RegExp))continue;const N=l(y,O)[Z],x=o.slice(u).join("/");if(L instanceof RegExp){const A=L.exec(x);if(A){if(I[ee]=A[0],s.push(...v(this,V,te).call(this,N,r,l(y,j),I)),Object.keys(l(N,O)).length){h(N,j,I);const H=((d=A[0].match(/\//))==null?void 0:d.length)??0;(i[H]||(i[H]=[])).push(N)}continue}}(L===!0||L.test(m))&&(I[ee]=m,f?(s.push(...v(this,V,te).call(this,N,r,I,l(y,j))),l(N,O)["*"]&&s.push(...v(this,V,te).call(this,l(N,O)["*"],r,I,l(y,j)))):(h(N,j,I),E.push(N)))}}a=E.concat(i.shift()??[])}return s.length>1&&s.sort((u,c)=>u.score-c.score),[s.map(({handler:u,params:c})=>[u,c])]}},Q=new WeakMap,O=new WeakMap,oe=new WeakMap,ye=new WeakMap,j=new WeakMap,V=new WeakSet,te=function(r,t,s,n){const a=[];for(let o=0,i=l(r,Q).length;o<i;o++){const d=l(r,Q)[o],u=d[t]||d[T],c={};if(u!==void 0&&(u.params=Object.create(null),a.push(u),s!==be||n&&n!==be))for(let m=0,f=u.possibleKeys.length;m<f;m++){const E=u.possibleKeys[m],_=c[u.score];u.params[E]=n!=null&&n[E]&&!_?n[E]:s[E]??(n==null?void 0:n[E]),c[u.score]=!0}}return a},we),ie,tr,ot=(tr=class{constructor(){g(this,"name","TrieRouter");b(this,ie);h(this,ie,new at)}add(e,r,t){const s=ar(r);if(s){for(let n=0,a=s.length;n<a;n++)l(this,ie).insert(e,s[n],t);return}l(this,ie).insert(e,r,t)}match(e,r){return l(this,ie).search(e,r)}},ie=new WeakMap,tr),_r=class extends Kr{constructor(e={}){super(e),this.router=e.router??new nt({routers:[new st,new ot]})}},it=e=>{const t={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},s=(a=>typeof a=="string"?a==="*"?()=>a:o=>a===o?o:null:typeof a=="function"?a:o=>a.includes(o)?o:null)(t.origin),n=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(t.allowMethods);return async function(o,i){var c;function d(m,f){o.res.headers.set(m,f)}const u=await s(o.req.header("origin")||"",o);if(u&&d("Access-Control-Allow-Origin",u),t.credentials&&d("Access-Control-Allow-Credentials","true"),(c=t.exposeHeaders)!=null&&c.length&&d("Access-Control-Expose-Headers",t.exposeHeaders.join(",")),o.req.method==="OPTIONS"){t.origin!=="*"&&d("Vary","Origin"),t.maxAge!=null&&d("Access-Control-Max-Age",t.maxAge.toString());const m=await n(o.req.header("origin")||"",o);m.length&&d("Access-Control-Allow-Methods",m.join(","));let f=t.allowHeaders;if(!(f!=null&&f.length)){const E=o.req.header("Access-Control-Request-Headers");E&&(f=E.split(/\s*,\s*/))}return f!=null&&f.length&&(d("Access-Control-Allow-Headers",f.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await i(),t.origin!=="*"&&o.header("Vary","Origin",{append:!0})}},dt=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Je=(e,r=ct)=>{const t=/\.([a-zA-Z0-9]+?)$/,s=e.match(t);if(!s)return;let n=r[s[1]];return n&&n.startsWith("text")&&(n+="; charset=utf-8"),n},ut={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ct=ut,lt=(...e)=>{let r=e.filter(n=>n!=="").join("/");r=r.replace(new RegExp("(?<=\\/)\\/+","g"),"");const t=r.split("/"),s=[];for(const n of t)n===".."&&s.length>0&&s.at(-1)!==".."?s.pop():n!=="."&&s.push(n);return s.join("/")||"."},yr={br:".br",zstd:".zst",gzip:".gz"},pt=Object.keys(yr),mt="index.html",ft=e=>{const r=e.root??"./",t=e.path,s=e.join??lt;return async(n,a)=>{var c,m,f,E;if(n.finalized)return a();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(n.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((c=e.onNotFound)==null?void 0:c.call(e,n.req.path,n)),a()}let i=s(r,!t&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(i)&&(i=s(i,mt));const d=e.getContent;let u=await d(i,n);if(u instanceof Response)return n.newResponse(u.body,u);if(u){const _=e.mimes&&Je(i,e.mimes)||Je(i);if(n.header("Content-Type",_||"application/octet-stream"),e.precompressed&&(!_||dt.test(_))){const w=new Set((m=n.req.header("Accept-Encoding"))==null?void 0:m.split(",").map(y=>y.trim()));for(const y of pt){if(!w.has(y))continue;const R=await d(i+yr[y],n);if(R){u=R,n.header("Content-Encoding",y),n.header("Vary","Accept-Encoding",{append:!0});break}}}return await((f=e.onFound)==null?void 0:f.call(e,i,n)),n.body(u)}await((E=e.onNotFound)==null?void 0:E.call(e,i,n)),await a()}},Et=async(e,r)=>{let t;r&&r.manifest?typeof r.manifest=="string"?t=JSON.parse(r.manifest):t=r.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?t=JSON.parse(__STATIC_CONTENT_MANIFEST):t=__STATIC_CONTENT_MANIFEST;let s;r&&r.namespace?s=r.namespace:s=__STATIC_CONTENT;const n=t[e]||e;if(!n)return null;const a=await s.get(n,{type:"stream"});return a||null},ht=e=>async function(t,s){return ft({...e,getContent:async a=>Et(a,{manifest:e.manifest,namespace:e.namespace?e.namespace:t.env?t.env.__STATIC_CONTENT:void 0})})(t,s)},gt=e=>ht(e);async function _t(e,r,t,s,n){const a={typ:"JWT",alg:"HS256",cty:"twilio-fpa;v=1"},o=Math.floor(Date.now()/1e3),i=o+3600,d={room:n},u={jti:`${r}-${o}`,iss:r,sub:e,exp:i,grants:{identity:s,video:d}},c=U=>{const I=JSON.stringify(U);return btoa(I).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},m=c(a),f=c(u),E=`${m}.${f}`,_=new TextEncoder,w=_.encode(t),y=await crypto.subtle.importKey("raw",w,{name:"HMAC",hash:"SHA-256"},!1,["sign"]),R=await crypto.subtle.sign("HMAC",y,_.encode(E)),k=new Uint8Array(R);let D=btoa(String.fromCharCode(...k));return D=D.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),`${E}.${D}`}const p=new _r;p.use("/api/*",it());p.use("/static/*",gt({root:"./public"}));async function wr(e,r,t,s,n){try{const a=`${t}/verify-email?token=${r}`,o=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${n}>`,to:e,subject:"Verify your Amebo account",html:`
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
        `})});if(!o.ok){const i=await o.text();return console.error("[EMAIL] Resend API error:",i),!1}return!0}catch(a){return console.error("[EMAIL] Send error:",a),!1}}p.post("/api/auth/register-email",async e=>{var r;try{const{email:t,password:s}=await e.req.json();if(!t||!s)return e.json({error:"Email and password required"},400);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))return e.json({error:"Invalid email format"},400);const a=await e.env.DB.prepare(`
      SELECT id, email_verified FROM users WHERE email = ?
    `).bind(t).first();if(a)return a.email_verified===1?e.json({error:"Email already registered. Please login instead."},409):e.json({error:"Email already registered but not verified",message:'This email is already registered but not verified. Please check your email for the verification link, or click "Resend Verification Email" on the login page.',canResend:!0},409);const o=crypto.randomUUID(),i=crypto.randomUUID(),d=new Date(Date.now()+1440*60*1e3),u=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)),c=Array.from(new Uint8Array(u)).map(_=>_.toString(16).padStart(2,"0")).join("");await e.env.DB.prepare(`
      INSERT INTO users (
        id, username, email, public_key, email_verified, 
        verification_token, verification_expires, country_code, tokens
      ) VALUES (?, ?, ?, ?, 0, ?, ?, 'NG', 0)
    `).bind(o,t.split("@")[0],t,c,i,d.toISOString()).run();const m=e.env.APP_URL||"http://localhost:3000",f=e.env.RESEND_API_KEY||"",E=e.env.FROM_EMAIL||"onboarding@resend.dev";try{if(f)await wr(t,i,m,f,E),console.log(`[EMAIL] Verification email sent to: ${t}`);else{const _=`${m}/verify-email?token=${i}`;console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),console.log("[EMAIL] ⚠️  RESEND_API_KEY not configured"),console.log("[EMAIL] 📧 Development mode - Manual verification link:"),console.log(`[EMAIL] 🔗 ${_}`),console.log("[EMAIL] 📋 Copy this link to verify your email in development"),console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}}catch(_){console.error("[EMAIL] Failed to send verification email:",_)}return console.log(`[AUTH] User registered: ${t} (verification pending)`),e.json({success:!0,userId:o,email:t,message:"Registration successful! Please check your email to verify your account.",verificationRequired:!0,verificationToken:f?void 0:i})}catch(t){return console.error("[AUTH] Registration error:",t),(r=t.message)!=null&&r.includes("UNIQUE constraint")?e.json({error:"Email already registered"},409):e.json({error:"Registration failed",details:t.message||"Unknown error"},500)}});p.get("/api/auth/verify-email/:token",async e=>{try{const r=e.req.param("token"),t=await e.env.DB.prepare(`
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
    `).bind(t.id).run(),console.log(`[AUTH] Email verified: ${t.email} (+20 tokens bonus)`),e.json({success:!0,message:"Email verified successfully! You earned 20 tokens!",userId:t.id})):e.json({error:"Invalid or expired verification link"},400)}catch(r){return console.error("[AUTH] Verification error:",r),e.json({error:"Verification failed"},500)}});p.post("/api/auth/login-email",async e=>{try{const{email:r,password:t}=await e.req.json();if(!r||!t)return e.json({error:"Email and password required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(o=>o.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT id, username, email, email_verified, tokens, token_tier, avatar, created_at 
      FROM users 
      WHERE email = ? AND public_key = ?
    `).bind(r,n).first();return a?a.email_verified?(console.log(`[AUTH] User logged in: ${r}`),e.json({success:!0,user:{id:a.id,username:a.username,email:a.email,avatar:a.avatar||null,tokens:a.tokens||0,tier:a.token_tier||"bronze",emailVerified:a.email_verified===1}})):e.json({error:"Please verify your email first",verificationRequired:!0},403):e.json({error:"Invalid email or password"},401)}catch(r){return console.error("[AUTH] Login error:",r),e.json({error:"Login failed"},500)}});p.post("/api/auth/resend-verification",async e=>{try{const{email:r}=await e.req.json(),t=await e.env.DB.prepare(`
      SELECT id, email, email_verified FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({error:"Email not found"},404);if(t.email_verified===1)return e.json({error:"Email already verified"},400);const s=crypto.randomUUID(),n=new Date(Date.now()+1440*60*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `).bind(s,n.toISOString(),t.id).run();const a=e.env.APP_URL||"http://localhost:3000",o=e.env.RESEND_API_KEY||"",i=e.env.FROM_EMAIL||"onboarding@resend.dev";return o&&await wr(r,s,a,o,i),e.json({success:!0,message:"Verification email sent"})}catch(r){return console.error("[AUTH] Resend error:",r),e.json({error:"Failed to resend verification"},500)}});p.get("/api/auth/dev/verification-link/:email",async e=>{try{const r=e.req.param("email"),t=await e.env.DB.prepare(`
      SELECT verification_token, email_verified FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({error:"Email not found"},404);if(t.email_verified===1)return e.json({error:"Email already verified",verified:!0},400);const n=`${e.env.APP_URL||"http://localhost:3000"}/verify-email?token=${t.verification_token}`;return e.json({success:!0,verificationUrl:n,message:"Click this link to verify your email"})}catch(r){return console.error("[DEV] Get verification link error:",r),e.json({error:"Failed to get verification link"},500)}});p.post("/api/auth/forgot-password",async e=>{try{const{email:r}=await e.req.json();if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."});const s=new Date(Date.now()-3600*1e3).toISOString();if(t.last_password_reset&&t.last_password_reset>s&&t.password_reset_attempts>=5)return e.json({error:"Too many password reset attempts. Please try again in 1 hour."},429);const n=crypto.randomUUID(),a=new Date(Date.now()+3600*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET password_reset_token = ?,
          password_reset_expires = ?,
          password_reset_attempts = password_reset_attempts + 1,
          last_password_reset = ?
      WHERE id = ?
    `).bind(n,a.toISOString(),new Date().toISOString(),t.id).run();const o=e.env.APP_URL||"http://localhost:3000",i=e.env.RESEND_API_KEY||"",d=e.env.FROM_EMAIL||"onboarding@resend.dev";if(i)try{const u=`${o}/reset-password?token=${n}`,c=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${d}>`,to:r,subject:"Reset your Amebo password",html:`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request 🔐</h2>
                <p>We received a request to reset your Amebo password.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${u}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #7c3aed; word-break: break-all;">${u}</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            `})});if(c.ok)console.log("[EMAIL] Password reset email sent to:",r);else{const m=await c.json();console.error("[EMAIL] Resend API error:",m)}}catch(u){console.error("[EMAIL] Failed to send password reset email:",u)}else console.log("[EMAIL] Password reset link (RESEND_API_KEY not set):",`${o}/reset-password?token=${n}`);return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."})}catch(r){return console.error("[AUTH] Forgot password error:",r),e.json({error:"Failed to process password reset request",message:r.message},500)}});p.post("/api/auth/reset-password",async e=>{try{const{token:r,newPassword:t}=await e.req.json();if(!r||!t)return e.json({error:"Token and new password required"},400);if(t.length<8)return e.json({error:"Password must be at least 8 characters long"},400);if(!/[A-Z]/.test(t))return e.json({error:"Password must contain at least one uppercase letter"},400);if(!/[0-9]/.test(t))return e.json({error:"Password must contain at least one number"},400);const s=await e.env.DB.prepare(`
      SELECT id, email, password_reset_expires FROM users 
      WHERE password_reset_token = ?
    `).bind(r).first();if(!s)return e.json({error:"Invalid or expired reset token"},400);const n=new Date,a=new Date(s.password_reset_expires);if(n>a)return e.json({error:"Reset token has expired. Please request a new one."},400);const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),i=Array.from(new Uint8Array(o)).map(d=>d.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET public_key = ?,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          password_reset_attempts = 0
      WHERE id = ?
    `).bind(i,s.id).run(),console.log("[AUTH] Password reset successful for:",s.email),e.json({success:!0,message:"Password reset successfully. You can now login with your new password."})}catch(r){return console.error("[AUTH] Reset password error:",r),e.json({error:"Failed to reset password",message:r.message},500)}});p.post("/api/auth/register",async e=>{var r;try{const{username:t,publicKey:s}=await e.req.json();if(!t||!s)return e.json({error:"Username and public key required"},400);const n=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO users (id, username, public_key) VALUES (?, ?, ?)
    `).bind(n,t,s).run(),e.json({success:!0,userId:n,username:t,message:"User registered successfully"})}catch(t){return(r=t.message)!=null&&r.includes("UNIQUE constraint failed")?e.json({error:"Username already exists"},409):e.json({error:"Registration failed"},500)}});p.post("/api/auth/login",async e=>{try{const{username:r}=await e.req.json(),t=await e.env.DB.prepare(`
      SELECT id, username, public_key, avatar, created_at FROM users WHERE username = ?
    `).bind(r).first();return t?e.json({success:!0,user:t}):e.json({error:"User not found"},404)}catch{return e.json({error:"Login failed"},500)}});p.get("/api/users/search",async e=>{var r;try{const t=e.req.query("q"),s=e.req.header("X-User-Email");if(!t||t.length<2)return e.json({error:"Search query must be at least 2 characters"},400);let n="";if(s){const o=await e.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(s).first();n=(o==null?void 0:o.id)||""}const a=await e.env.DB.prepare(`
      SELECT id, username, display_name, bio, email, avatar
      FROM users
      WHERE is_searchable = 1
        AND id != ?
        AND (username LIKE ? OR display_name LIKE ? OR email LIKE ?)
      LIMIT 20
    `).bind(n,`%${t}%`,`%${t}%`,`%${t}%`).all();return console.log(`[SEARCH] Query: "${t}", Found: ${((r=a.results)==null?void 0:r.length)||0} users`),e.json({success:!0,users:a.results||[]})}catch(t){return console.error("User search error:",t),e.json({error:"Search failed"},500)}});p.get("/api/users/blocked",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar, bu.blocked_at
      FROM blocked_users bu
      JOIN users u ON bu.blocked_user_id = u.id
      WHERE bu.user_id = ?
      ORDER BY bu.blocked_at DESC
    `).bind(t.id).all();return e.json({success:!0,blockedUsers:s.results||[]})}catch(r){return console.error("Get blocked users error:",r),e.json({error:"Failed to get blocked users"},500)}});p.get("/api/users/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT id, username, public_key, avatar, created_at FROM users WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,user:t}):e.json({error:"User not found"},404)}catch{return e.json({error:"Failed to fetch user"},500)}});p.post("/api/users/update-avatar",async e=>{try{const{userId:r,avatar:t}=await e.req.json();return r?(await e.env.DB.prepare(`
      UPDATE users SET avatar = ? WHERE id = ?
    `).bind(t,r).run(),e.json({success:!0,message:"Avatar updated"})):e.json({error:"User ID required"},400)}catch(r){return console.error("Avatar update error:",r),e.json({error:"Failed to update avatar"},500)}});p.post("/api/users/update-username",async e=>{try{const{userId:r,username:t}=await e.req.json();return!r||!t?e.json({error:"User ID and username required"},400):await e.env.DB.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).bind(t,r).first()?e.json({error:"Username already taken"},409):(await e.env.DB.prepare(`
      UPDATE users SET username = ? WHERE id = ?
    `).bind(t,r).run(),e.json({success:!0,message:"Username updated"}))}catch(r){return console.error("Username update error:",r),e.json({error:"Failed to update username"},500)}});p.post("/api/users/update-password",async e=>{try{const{userId:r,email:t,currentPassword:s,newPassword:n}=await e.req.json();if(!r||!s||!n)return e.json({error:"All fields required"},400);const a=await e.env.DB.prepare(`
      SELECT password_hash FROM users WHERE id = ? AND email = ?
    `).bind(r,t).first();if(!a)return e.json({error:"User not found"},404);if(!await bcrypt.compare(s,a.password_hash))return e.json({error:"Current password is incorrect"},401);const i=await bcrypt.hash(n,10);return await e.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(i,r).run(),e.json({success:!0,message:"Password updated"})}catch(r){return console.error("Password update error:",r),e.json({error:"Failed to update password"},500)}});p.post("/api/rooms/create",async e=>{var r;try{const{roomCode:t,roomName:s,userId:n,memberIds:a}=await e.req.json();if(!t||!n)return e.json({error:"Room code and user ID required"},400);const o=crypto.randomUUID();if(await e.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by) VALUES (?, ?, ?, ?)
    `).bind(o,t,s||"Private Chat",n).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(o,n).run(),a&&Array.isArray(a))for(const i of a)i!==n&&await e.env.DB.prepare(`
            INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
          `).bind(o,i).run();return e.json({success:!0,roomId:o,roomCode:t,message:"Room created successfully"})}catch(t){return(r=t.message)!=null&&r.includes("UNIQUE constraint failed")?e.json({error:"Room code already exists"},409):e.json({error:"Failed to create room"},500)}});p.post("/api/rooms/join",async e=>{try{const{roomCode:r,userId:t}=await e.req.json();if(!r||!t)return e.json({error:"Room code and user ID required"},400);const s=await e.env.DB.prepare(`
      SELECT id, room_code, room_name FROM chat_rooms WHERE room_code = ?
    `).bind(r).first();return s?(await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(s.id,t).first()||await e.env.DB.prepare(`
        INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
      `).bind(s.id,t).run(),e.json({success:!0,room:s,message:"Joined room successfully"})):e.json({error:"Room not found"},404)}catch{return e.json({error:"Failed to join room"},500)}});p.get("/api/rooms/user/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT cr.id, cr.room_code, cr.room_name, cr.created_at,
             (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count
      FROM chat_rooms cr
      JOIN room_members rm ON cr.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY cr.created_at DESC
    `).bind(r).all();return e.json({success:!0,rooms:t.results||[]})}catch{return e.json({error:"Failed to fetch rooms"},500)}});p.get("/api/rooms/:roomId/members",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.public_key, rm.joined_at
      FROM users u
      JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at ASC
    `).bind(r).all();return e.json({success:!0,members:t.results||[]})}catch{return e.json({error:"Failed to fetch members"},500)}});p.post("/api/users/privacy",async e=>{try{const r=e.req.header("X-User-Email"),{is_searchable:t,message_privacy:s,last_seen_privacy:n}=await e.req.json();if(!r)return e.json({error:"User email required"},400);const a=await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first();return a?(await e.env.DB.prepare(`
      UPDATE users
      SET is_searchable = ?,
          message_privacy = ?,
          last_seen_privacy = ?
      WHERE id = ?
    `).bind(t?1:0,s||"anyone",n||"everyone",a.id).run(),console.log(`[PRIVACY] Updated settings for user ${a.id}:`,{is_searchable:t,message_privacy:s,last_seen_privacy:n}),e.json({success:!0,message:"Privacy settings updated"})):e.json({error:"User not found"},404)}catch(r){return console.error("Privacy update error:",r),e.json({error:"Failed to update privacy settings"},500)}});p.get("/api/users/:userId/privacy",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT is_searchable, message_privacy, last_seen_privacy
      FROM users
      WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,privacy:{isSearchable:t.is_searchable===1,messagePrivacy:t.message_privacy||"anyone",lastSeenPrivacy:t.last_seen_privacy||"everyone"}}):e.json({error:"User not found"},404)}catch(r){return console.error("Privacy fetch error:",r),e.json({error:"Failed to fetch privacy settings"},500)}});p.post("/api/rooms/direct",async e=>{try{const r=e.req.header("X-User-Email"),t=await e.req.json();let s,n;if(t.recipient_id&&r){const E=await e.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(r).first();if(!E)return e.json({error:"User not found"},404);s=E.id,n=t.recipient_id}else if(t.user1Id&&t.user2Id)s=t.user1Id,n=t.user2Id;else return e.json({error:"Both user IDs required"},400);if(!s||!n)return e.json({error:"Both user IDs required"},400);if(s===n)return e.json({error:"Cannot create DM with yourself"},400);const a=await e.env.DB.prepare(`
      SELECT message_privacy FROM users WHERE id = ?
    `).bind(n).first();if((a==null?void 0:a.message_privacy)==="contacts_only"&&!await e.env.DB.prepare(`
        SELECT status FROM user_contacts
        WHERE user_id = ? AND contact_user_id = ? AND status = 'accepted'
      `).bind(n,s).first())return e.json({error:"This user only accepts messages from contacts",needsContact:!0},403);let o=await e.env.DB.prepare(`
      SELECT id, room_id FROM direct_message_rooms
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).bind(s,n,n,s).first();if(o){const E=await e.env.DB.prepare(`
        SELECT * FROM chat_rooms WHERE id = ?
      `).bind(o.room_id).first();return e.json({success:!0,room:E,isNew:!1})}const i=crypto.randomUUID(),d=crypto.randomUUID(),u=await e.env.DB.prepare(`
      SELECT username, display_name FROM users WHERE id = ?
    `).bind(n).first(),c=(u==null?void 0:u.display_name)||(u==null?void 0:u.username)||"Direct Message",m=`dm-${crypto.randomUUID().slice(0,8)}`;await e.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by, room_type)
      VALUES (?, ?, ?, ?, 'direct')
    `).bind(i,m,c,s).run(),await e.env.DB.prepare(`
      INSERT INTO direct_message_rooms (id, user1_id, user2_id, room_id)
      VALUES (?, ?, ?, ?)
    `).bind(d,s,n,i).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(i,s).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(i,n).run();const f=await e.env.DB.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `).bind(i).first();return e.json({success:!0,room:f,isNew:!0,message:"Direct message room created"})}catch(r){return console.error("DM creation error:",r),e.json({error:"Failed to create direct message",details:r.message},500)}});p.get("/api/rooms/shared/:userId/:otherUserId",async e=>{var r;try{const t=e.req.param("userId"),s=e.req.param("otherUserId"),n=await e.env.DB.prepare(`
      SELECT DISTINCT r.id, r.room_code, r.room_name, r.created_at,
        (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) as member_count
      FROM chat_rooms r
      INNER JOIN room_members rm1 ON r.id = rm1.room_id AND rm1.user_id = ?
      INNER JOIN room_members rm2 ON r.id = rm2.room_id AND rm2.user_id = ?
      WHERE r.room_code NOT LIKE 'dm-%'
      ORDER BY r.created_at DESC
    `).bind(t,s).all();return console.log(`[SHARED_GROUPS] Found ${((r=n.results)==null?void 0:r.length)||0} shared groups`),e.json({groups:n.results||[]})}catch(t){return console.error("[SHARED_GROUPS] Error:",t),e.json({error:"Failed to load shared groups",details:t.message},500)}});p.post("/api/rooms/:roomId/leave",async e=>{try{const r=e.req.header("X-User-Email"),{roomId:t}=e.req.param();if(!r)return e.json({error:"User email required"},400);if(!t)return e.json({error:"Room ID required"},400);const s=await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first();if(!s)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
      DELETE FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(t,s.id).run();const n=await e.env.DB.prepare(`
      SELECT COUNT(*) as count FROM room_members WHERE room_id = ?
    `).bind(t).first();return n&&n.count===0&&(await e.env.DB.prepare(`
        DELETE FROM messages WHERE room_id = ?
      `).bind(t).run(),await e.env.DB.prepare(`
        DELETE FROM direct_message_rooms WHERE room_id = ?
      `).bind(t).run(),await e.env.DB.prepare(`
        DELETE FROM chat_rooms WHERE id = ?
      `).bind(t).run(),console.log(`[ROOM] Deleted empty room: ${t}`)),e.json({success:!0,message:"Left room successfully"})}catch(r){return console.error("[ROOM] Leave error:",r),e.json({error:"Failed to leave room",details:r.message},500)}});p.post("/api/messages/send",async e=>{try{const{roomId:r,senderId:t,encryptedContent:s,iv:n}=await e.req.json();if(!r||!t||!s||!n)return e.json({error:"All fields required"},400);if(!await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(r,t).first())return e.json({error:"Not a member of this room"},403);const o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO messages (id, room_id, sender_id, encrypted_content, iv) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(o,r,t,s,n).run();try{const i=await e.env.DB.prepare(`
        SELECT username FROM users WHERE id = ?
      `).bind(t).first(),d=await e.env.DB.prepare(`
        SELECT room_name, room_code FROM rooms WHERE id = ?
      `).bind(r).first(),{results:u}=await e.env.DB.prepare(`
        SELECT user_id FROM room_members WHERE room_id = ? AND user_id != ?
      `).bind(r,t).all(),c=(d==null?void 0:d.room_name)||(d==null?void 0:d.room_code)||"Unknown Room",m=(i==null?void 0:i.username)||"Someone";for(const f of u||[]){const E=crypto.randomUUID();await e.env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, data, read)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(E,f.user_id,"new_message",`New message in ${c}`,`${m} sent a message`,JSON.stringify({roomId:r,messageId:o,senderId:t,roomName:c})).run(),console.log(`[NOTIFICATION] Created for user ${f.user_id} in room ${c}`)}}catch(i){console.error("[NOTIFICATION] Error creating notifications:",i)}return e.json({success:!0,messageId:o,message:"Message sent successfully"})}catch{return e.json({error:"Failed to send message"},500)}});p.get("/api/messages/:roomId",async e=>{try{const r=e.req.param("roomId"),t=parseInt(e.req.query("limit")||"50"),s=parseInt(e.req.query("offset")||"0"),n=await e.env.DB.prepare(`
      SELECT m.id, m.room_id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
             u.username, u.public_key
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(r,t,s).all();return e.json({success:!0,messages:(n.results||[]).reverse()})}catch{return e.json({error:"Failed to fetch messages"},500)}});p.post("/api/twilio/token",async e=>{try{const{roomCode:r,userName:t}=await e.req.json();if(!r||!t)return e.json({error:"Room code and user name required"},400);const s=e.env.TWILIO_ACCOUNT_SID,n=e.env.TWILIO_API_KEY,a=e.env.TWILIO_API_SECRET;if(!s||!n||!a)return e.json({error:"Twilio credentials not configured",message:"Please configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET in environment variables. See TWILIO_SETUP_GUIDE.md for details."},503);const o=t,i=r,d=await _t(s,n,a,o,i);return e.json({success:!0,token:d,identity:o,roomName:i,message:"Access token generated successfully"})}catch(r){return console.error("Twilio token generation error:",r),e.json({error:"Failed to generate access token",details:r.message},500)}});p.post("/api/notifications/subscribe",async e=>{try{const{userId:r,subscription:t}=await e.req.json();return!r||!t?e.json({error:"User ID and subscription required"},400):(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (user_id, subscription_data, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(r,JSON.stringify(t)).run(),e.json({success:!0,message:"Push subscription saved successfully"}))}catch{return e.json({error:"Failed to save subscription"},500)}});p.post("/api/notifications/send",async e=>{try{const{userId:r,title:t,body:s,data:n}=await e.req.json();if(!r||!t)return e.json({error:"User ID and title required"},400);const a=await e.env.DB.prepare(`
      SELECT subscription_data FROM push_subscriptions WHERE user_id = ?
    `).bind(r).first();if(!a)return e.json({error:"No push subscription found for user"},404);const o=JSON.parse(a.subscription_data);return e.json({success:!0,message:"Notification sent successfully",note:"Implement actual Web Push in production"})}catch{return e.json({error:"Failed to send notification"},500)}});p.post("/api/payments/naira/initialize",async e=>{try{const{userId:r,email:t,amount:s,reference:n}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, email, and amount required"},400);const a=n||`NGN-${Date.now()}-${crypto.randomUUID().slice(0,8)}`,o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO transactions (id, user_id, type, currency, amount, reference, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(o,r,"send","NGN",s.toString(),a,"pending",JSON.stringify({email:t})).run();const i=e.env.PAYSTACK_SECRET_KEY;if(i&&i!=="your_key_here")try{const u=await(await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({email:t,amount:Math.round(s*100),reference:a,callback_url:`${new URL(e.req.url).origin}/api/payments/naira/verify/${a}`})})).json();if(u.status)return e.json({success:!0,reference:a,authorizationUrl:u.data.authorization_url,accessCode:u.data.access_code,message:"Payment initialized. Redirecting to Paystack..."});throw new Error(u.message||"Paystack initialization failed")}catch(d){return console.error("Paystack API error:",d),e.json({error:"Payment initialization failed",details:d.message,note:"Please check your Paystack API key"},500)}else return e.json({success:!0,reference:a,authorizationUrl:`https://checkout.paystack.com/demo/${a}`,message:"⚠️ DEMO MODE: Add PAYSTACK_SECRET_KEY to use real payments. Get your key at https://paystack.com",demo:!0})}catch{return e.json({error:"Failed to initialize payment"},500)}});p.get("/api/payments/naira/verify/:reference",async e=>{var r;try{const t=e.req.param("reference"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions WHERE reference = ?
    `).bind(t).first();if(!s)return e.json({error:"Transaction not found"},404);const n=e.env.PAYSTACK_SECRET_KEY;if(n&&n!=="your_key_here")try{const o=await(await fetch(`https://api.paystack.co/transaction/verify/${t}`,{method:"GET",headers:{Authorization:`Bearer ${n}`}})).json();if(o.status&&o.data.status==="success")return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind("completed",t).run(),e.json({success:!0,status:"completed",amount:o.data.amount/100,currency:o.data.currency,paidAt:o.data.paid_at,channel:o.data.channel});{const i=((r=o.data)==null?void 0:r.status)||"failed";return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind(i,t).run(),e.json({success:!1,status:i,message:o.message||"Payment verification failed"})}}catch(a){return console.error("Paystack verification error:",a),e.json({error:"Verification failed",details:a.message},500)}else return await e.env.DB.prepare(`
        UPDATE transactions SET status = ? WHERE reference = ?
      `).bind("completed",t).run(),e.json({success:!0,status:"completed",amount:s.amount,currency:s.currency,demo:!0,message:"⚠️ DEMO MODE: Transaction auto-completed. Add PAYSTACK_SECRET_KEY for real verification."})}catch{return e.json({error:"Failed to verify payment"},500)}});p.get("/api/transactions/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,transactions:s.results||[]})}catch{return e.json({error:"Failed to fetch transactions"},500)}});p.get("/api/crypto/bitcoin/:address",async e=>{try{const r=e.req.param("address");try{const t=await fetch(`https://blockchain.info/q/addressbalance/${r}`);if(t.ok){const s=await t.text(),n=(parseInt(s)/1e8).toFixed(8);return e.json({success:!0,currency:"BTC",address:r,balance:n,balanceSatoshi:s})}else throw new Error("Failed to fetch Bitcoin balance")}catch(t){return console.error("Blockchain.info API error:",t),e.json({success:!0,currency:"BTC",address:r,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance from Blockchain.info",error:t.message})}}catch{return e.json({error:"Failed to fetch Bitcoin balance"},500)}});p.get("/api/crypto/ethereum/:address",async e=>{try{const r=e.req.param("address"),t=e.env.ETHERSCAN_API_KEY;try{const s=t&&t.length===32&&t!=="your_key_here",n=s?`https://api.etherscan.io/api?module=account&action=balance&address=${r}&tag=latest&apikey=${t}`:`https://api.etherscan.io/api?module=account&action=balance&address=${r}&tag=latest`,o=await(await fetch(n)).json();if(o.status==="1"&&o.result){const i=(parseInt(o.result)/1e18).toFixed(8);return e.json({success:!0,currency:"ETH",address:r,balance:i,balanceWei:o.result,note:s?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(o.message&&o.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:o.message},429);throw new Error(o.message||"Failed to fetch balance")}}catch(s){return console.error("Etherscan API error:",s),e.json({success:!0,currency:"ETH",address:r,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:s.message})}}catch{return e.json({error:"Failed to fetch Ethereum balance"},500)}});p.get("/api/crypto/usdt/:address",async e=>{try{const r=e.req.param("address"),t=e.env.ETHERSCAN_API_KEY,s="0xdac17f958d2ee523a2206206994597c13d831ec7";try{const n=t&&t.length===32&&t!=="your_key_here",a=n?`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${r}&tag=latest&apikey=${t}`:`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${r}&tag=latest`,i=await(await fetch(a)).json();if(i.status==="1"&&i.result){const d=(parseInt(i.result)/1e6).toFixed(6);return e.json({success:!0,currency:"USDT",address:r,balance:d,balanceRaw:i.result,network:"Ethereum (ERC-20)",note:n?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(i.message&&i.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:i.message},429);throw new Error(i.message||"Failed to fetch balance")}}catch(n){return console.error("Etherscan USDT API error:",n),e.json({success:!0,currency:"USDT",address:r,balance:"0.000000",demo:!0,network:"Ethereum (ERC-20)",message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:n.message})}}catch{return e.json({error:"Failed to fetch USDT balance"},500)}});p.get("/test",e=>e.html(`
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
  `));p.get("/simple",e=>e.html(`
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
  `));p.get("/",e=>e.html(`
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
        <script src="/static/crypto-v2.js?v=NOTIF-FIX-V2"><\/script>
        <script src="/static/app-v3.js?v=COMPACT-BUBBLE-USERNAME"><\/script><\/script>
        
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
  `).first(),i=(o==null?void 0:o.cap_value)||1400;let d=await e.prepare(`
    SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(r,s).first();d||(await e.prepare(`
      INSERT INTO monthly_earning_caps (user_id, year_month, total_earned, messages_count, files_count, rooms_created_count, rooms_joined_count)
      VALUES (?, ?, 0, 0, 0, 0, 0)
    `).bind(r,s).run(),d={total_earned:0});const u=d.total_earned||0,c=a-u;if(u+t>a)return await e.prepare(`
      INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
      VALUES (?, ?, 'cap_exceeded', ?, ?, ?, 1)
    `).bind(r,s,t,u,a).run(),{allowed:!1,reason:`Monthly token limit reached! You've earned ${u}/${a} tokens this month. Resets next month.`,current:u,limit:a,remaining:c>0?c:0,isWarning:!1};const m=u+t>=i;return{allowed:!0,current:u,limit:a,remaining:c-t,isWarning:m}}async function vr(e,r,t,s){const n=new Date().toISOString().substring(0,7);let a="";switch(s){case"message":case"message_sent":a="messages_count";break;case"file_share":case"file_shared":a="files_count";break;case"room_create":a="rooms_created_count";break;case"room_join":a="rooms_joined_count";break}a?await e.prepare(`
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
  `).first(),i=(o==null?void 0:o.cap_value)||1500,d=await e.prepare(`
    SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(r,n).first(),u=(d==null?void 0:d.total_earned)||0;await e.prepare(`
    INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).bind(r,n,s,t,u,i).run(),await e.prepare(`
    UPDATE users 
    SET current_month_tokens = ?,
        last_token_reset_month = ?
    WHERE id = ?
  `).bind(u,n,r).run()}async function yt(e,r,t,s){const n=new Date().toISOString().split("T")[0];let a=await e.prepare(`
    SELECT * FROM daily_earning_caps WHERE user_id = ? AND date = ?
  `).bind(r,n).first();a||(await e.prepare(`
      INSERT INTO daily_earning_caps (user_id, date, messages_count, files_count, total_earned)
      VALUES (?, ?, 0, 0, 0)
    `).bind(r,n).run(),a={messages_count:0,files_count:0,total_earned:0});const o=100,i=60,d=500;return t==="message_sent"&&a.messages_count+s>o?{allowed:!1,reason:"Daily message token limit reached",current:a.messages_count,limit:o}:t==="file_shared"&&a.files_count+s>i?{allowed:!1,reason:"Daily file sharing token limit reached",current:a.files_count,limit:i}:a.total_earned+s>d?{allowed:!1,reason:"Daily total token limit reached",current:a.total_earned,limit:d}:{allowed:!0}}p.post("/api/tokens/award",async e=>{try{const{userId:r,amount:t,reason:s}=await e.req.json();if(!r||!t)return e.json({error:"User ID and amount required"},400);if(t<=0)return e.json({error:"Amount must be greater than 0"},400);const n=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned FROM users WHERE id = ?
    `).bind(r).first();if(!n)return e.json({error:"User not found"},404);const a=n.tokens||0,{tier:o,multiplier:i}=qe(a),d=await br(e.env.DB,r,t);if(!d.allowed)return console.log(`[TOKEN ECONOMY] ❌ Monthly limit reached for ${r}: ${d.reason}`),e.json({error:d.reason,monthlyLimitReached:!0,current:d.current,limit:d.limit,remaining:d.remaining},429);const u=["message_sent","file_shared","message","file_share"];if(u.includes(s)){const w=await yt(e.env.DB,r,s,t);if(!w.allowed)return console.log(`[TOKEN ECONOMY] ⚠️ Daily limit reached for ${r}: ${w.reason}`),e.json({error:w.reason,dailyLimitReached:!0,current:w.current,limit:w.limit},429)}const c=Math.floor(t*i),m=a+c,f=qe(m).tier;if(await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?, 
          token_tier = ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(c,f,c,r).run(),await e.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier, daily_total)
      VALUES (?, ?, ?, ?, ?)
    `).bind(r,s,c,o,c).run(),u.includes(s)){const w=new Date().toISOString().split("T")[0],y=s==="message_sent"||s==="message"?"messages_count":"files_count";await e.env.DB.prepare(`
        UPDATE daily_earning_caps 
        SET ${y} = ${y} + ?,
            total_earned = total_earned + ?
        WHERE user_id = ? AND date = ?
      `).bind(c,c,r,w).run()}await vr(e.env.DB,r,c,s);const E=i>1?` (${o} tier ${i}x bonus!)`:"",_=d.isWarning?` ⚠️ Approaching monthly limit (${d.current+c}/${d.limit})`:"";return console.log(`[TOKEN ECONOMY] User ${r} earned ${c} tokens for ${s}${E}. New balance: ${m}${_}`),e.json({success:!0,newBalance:m,amount:c,baseAmount:t,multiplier:i,tier:f,tierBonus:i>1,reason:s,monthlyLimit:d.limit,monthlyEarned:d.current+c,monthlyRemaining:d.remaining,monthlyWarning:d.isWarning,monthlyPercentage:Math.floor((d.current+c)/d.limit*100)})}catch(r){return console.error("Award tokens error:",r),e.json({error:"Failed to award tokens"},500)}});p.get("/api/tokens/balance/:userId",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned, total_spent FROM users WHERE id = ?
    `).bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=t.tokens||0,{tier:n,multiplier:a}=qe(s),o=new Date().toISOString().split("T")[0],i=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(r,o).first();return e.json({success:!0,balance:s,tier:n,multiplier:a,totalEarned:t.total_earned||0,totalSpent:t.total_spent||0,dailyProgress:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,total:(i==null?void 0:i.total_earned)||0,limits:{messages:100,files:60,total:500}},nextTier:n==="bronze"?"silver (100 tokens)":n==="silver"?"gold (500 tokens)":n==="gold"?"platinum (1000 tokens)":"max tier reached"})}catch(r){return console.error("Get balance error:",r),e.json({error:"Failed to get balance"},500)}});p.get("/api/tokens/stats/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().split("T")[0],s=await e.env.DB.prepare(`
      SELECT username, tokens, token_tier, total_earned, total_spent,
             email, email_verified
      FROM users 
      WHERE id = ?
    `).bind(r).first();if(!s)return e.json({error:"User not found"},404);const a=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned
      FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(r,t).first()||{messages_count:0,files_count:0,total_earned:0};return e.json({success:!0,data:{username:s.username,email:s.email,token_balance:s.tokens,token_tier:s.token_tier,total_tokens_earned:s.total_earned||0,total_tokens_spent:s.total_spent||0,daily_messages_sent:a.messages_count,daily_files_sent:a.files_count,daily_tokens_earned:a.total_earned,daily_message_cap:100,daily_file_cap:60,daily_total_cap:500}})}catch(r){return console.error("Get stats error:",r),e.json({error:"Failed to get stats"},500)}});p.get("/api/tokens/history/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT action as type, amount, tier, created_at 
      FROM token_earnings 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,data:s.results||[]})}catch(r){return console.error("Get history error:",r),e.json({error:"Failed to get history"},500)}});p.get("/api/tokens/monthly/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
      SELECT cap_name, cap_value FROM monthly_cap_config WHERE is_active = 1
    `).all(),n={};s.results.forEach(E=>{n[E.cap_name]=E.cap_value});const a=n.monthly_total_cap||1500,o=n.warning_threshold||1400,i=await e.env.DB.prepare(`
      SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(r,t).first(),d=(i==null?void 0:i.total_earned)||0,u=a-d,c=Math.floor(d/a*100);let m="normal";d>=a?m="capped":d>=o&&(m="warning");const f=await e.env.DB.prepare(`
      SELECT action, tokens_earned, tokens_total, created_at
      FROM monthly_cap_history
      WHERE user_id = ? AND year_month = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(r,t).all();return e.json({success:!0,data:{yearMonth:t,earned:d,limit:a,remaining:u>0?u:0,percentage:c,status:m,warningThreshold:o,breakdown:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,roomsCreated:(i==null?void 0:i.rooms_created_count)||0,roomsJoined:(i==null?void 0:i.rooms_joined_count)||0},history:f.results||[]}})}catch(r){return console.error("Get monthly stats error:",r),e.json({error:"Failed to get monthly stats"},500)}});p.post("/api/tokens/bonus/award",async e=>{try{const{userId:r,bonusType:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and bonus type required"},400);const s=new Date().toISOString().substring(0,7);if(await e.env.DB.prepare(`
      SELECT * FROM user_bonus_achievements 
      WHERE user_id = ? AND year_month = ? AND bonus_type = ?
    `).bind(r,s,t).first())return e.json({error:"Bonus already awarded this month",alreadyAwarded:!0},400);const a=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config 
      WHERE cap_name = ? AND is_active = 1
    `).bind(`bonus_${t}`).first();if(!a)return e.json({error:"Invalid bonus type"},400);const o=a.cap_value,i=await br(e.env.DB,r,o);if(!i.allowed)return e.json({error:`Cannot award bonus - monthly limit reached (${i.current}/${i.limit})`,monthlyLimitReached:!0,current:i.current,limit:i.limit},429);const d=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(r).first();if(!d)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(o,o,r).run(),await e.env.DB.prepare(`
      INSERT INTO user_bonus_achievements (user_id, year_month, bonus_type, bonus_amount)
      VALUES (?, ?, ?, ?)
    `).bind(r,s,t,o).run(),await vr(e.env.DB,r,o,`bonus_${t}`);const u=(d.tokens||0)+o;return console.log(`[BONUS] User ${r} earned ${o} bonus tokens for ${t}. New balance: ${u}`),e.json({success:!0,bonusType:t,bonusAmount:o,newBalance:u,message:`🎉 +${o} bonus tokens!`,monthlyEarned:i.current+o,monthlyLimit:i.limit,monthlyRemaining:i.remaining})}catch(r){return console.error("Award bonus error:",r),e.json({error:"Failed to award bonus"},500)}});p.get("/api/tokens/bonus/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
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
    `).all(),i=s.results.map(E=>E.bonus_type),d=o.results.filter(E=>{const _=E.cap_name.replace("bonus_","");return!i.includes(_)}).map(E=>({type:E.cap_name.replace("bonus_",""),amount:E.cap_value,description:E.description})),u=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
    `).first(),c=(u==null?void 0:u.cap_value)||1500,m=await e.env.DB.prepare(`
      SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(r,t).first(),f=(m==null?void 0:m.total_earned)||0;return e.json({success:!0,data:{monthlyLimit:c,monthlyEarned:f,monthlyRemaining:c-f,totalBonusTokensEarned:a,earned:s.results||[],available:d,note:"Bonuses award instant tokens that count toward the 1500 monthly limit"}})}catch(r){return console.error("Get bonuses error:",r),e.json({error:"Failed to get bonuses"},500)}});p.post("/api/users/pin/set",async e=>{try{const{userId:r,pin:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and PIN required"},400);if(t.length!==4||!/^\d{4}$/.test(t))return e.json({error:"PIN must be exactly 4 digits"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(a=>a.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users SET pin = ? WHERE id = ?
    `).bind(n,r).run(),e.json({success:!0,message:"PIN set successfully"})}catch(r){return console.error("Set PIN error:",r),e.json({error:"Failed to set PIN"},500)}});p.post("/api/users/pin/verify",async e=>{try{const{userId:r,pin:t}=await e.req.json();if(!r||!t)return e.json({error:"User ID and PIN required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)),n=Array.from(new Uint8Array(s)).map(i=>i.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(r).first();if(!a||!a.pin)return e.json({verified:!1,error:"No PIN set"},400);const o=a.pin===n;return e.json({verified:o})}catch(r){return console.error("Verify PIN error:",r),e.json({error:"Failed to verify PIN"},500)}});p.get("/api/users/:userId/has-pin",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(r).first();return e.json({hasPin:!!(t&&t.pin)})}catch(r){return console.error("Check PIN error:",r),e.json({error:"Failed to check PIN"},500)}});p.post("/api/users/pin/security-question",async e=>{try{const{userId:r,question:t,answer:s}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, question, and answer required"},400);if(s.trim().length<3)return e.json({error:"Answer must be at least 3 characters"},400);const n=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s.toLowerCase().trim())),a=Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET security_question = ?, security_answer = ?
      WHERE id = ?
    `).bind(t,a,r).run(),console.log(`[SECURITY] User ${r} set security question`),e.json({success:!0,message:"Security question set successfully"})}catch(r){return console.error("Set security question error:",r),e.json({error:"Failed to set security question"},500)}});p.get("/api/users/:userId/security-question",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT security_question FROM users WHERE id = ?
    `).bind(r).first();return!t||!t.security_question?e.json({error:"No security question set"},404):e.json({success:!0,question:t.security_question})}catch(r){return console.error("Get security question error:",r),e.json({error:"Failed to get security question"},500)}});p.post("/api/users/pin/reset",async e=>{try{const{userId:r,answer:t,newPin:s}=await e.req.json();if(!r||!t||!s)return e.json({error:"User ID, answer, and new PIN required"},400);if(s.length!==4||!/^\d{4}$/.test(s))return e.json({error:"PIN must be exactly 4 digits"},400);const n=await e.env.DB.prepare(`
      SELECT security_answer, pin_reset_attempts, last_pin_reset FROM users WHERE id = ?
    `).bind(r).first();if(!n||!n.security_answer)return e.json({error:"No security question set"},404);const a=new Date;if(n.last_pin_reset){const c=new Date(n.last_pin_reset),m=(a.getTime()-c.getTime())/(1e3*60*60);if(m<1&&n.pin_reset_attempts>=5)return e.json({error:"Too many reset attempts. Please try again in 1 hour.",remainingTime:Math.ceil((1-m)*60)},429);m>=1&&await e.env.DB.prepare(`
          UPDATE users SET pin_reset_attempts = 0 WHERE id = ?
        `).bind(r).run()}const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t.toLowerCase().trim())),i=Array.from(new Uint8Array(o)).map(c=>c.toString(16).padStart(2,"0")).join("");if(n.security_answer!==i){await e.env.DB.prepare(`
        UPDATE users 
        SET pin_reset_attempts = pin_reset_attempts + 1,
            last_pin_reset = ?
        WHERE id = ?
      `).bind(a.toISOString(),r).run();const c=(n.pin_reset_attempts||0)+1,m=5-c;return console.log(`[PIN RESET] Failed attempt for user ${r}. Attempts: ${c}/5`),e.json({error:"Incorrect answer",verified:!1,remainingAttempts:Math.max(0,m)},400)}const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)),u=Array.from(new Uint8Array(d)).map(c=>c.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET pin = ?, 
          pin_reset_attempts = 0,
          last_pin_reset = ?
      WHERE id = ?
    `).bind(u,a.toISOString(),r).run(),console.log(`[PIN RESET] User ${r} successfully reset PIN`),e.json({success:!0,verified:!0,message:"PIN reset successfully"})}catch(r){return console.error("Reset PIN error:",r),e.json({error:"Failed to reset PIN"},500)}});p.post("/api/tokens/gift",async e=>{try{const{fromUserId:r,toUserId:t,amount:s,roomId:n,message:a,pin:o}=await e.req.json();if(!r||!t||!s||!o)return e.json({error:"From user, to user, amount, and PIN required"},400);if(s<=0)return e.json({error:"Amount must be greater than 0"},400);if(r===t)return e.json({error:"Cannot send tokens to yourself"},400);const i=new Date,d=new Date(i.getFullYear(),0,1),u=Math.floor((i.getTime()-d.getTime())/(1440*60*1e3)),c=Math.ceil((u+d.getDay()+1)/7),m=`${i.getFullYear()}-${String(c).padStart(2,"0")}`,f=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),E=(f==null?void 0:f.config_value)||150;let _=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(r,m).first();_||(await e.env.DB.prepare(`
        INSERT INTO weekly_gift_tracking (user_id, year_week, total_gifted, gift_count)
        VALUES (?, ?, 0, 0)
      `).bind(r,m).run(),_={user_id:r,year_week:m,total_gifted:0,gift_count:0});const w=_.total_gifted||0,y=E-w;if(w+s>E)return console.log(`[WEEKLY GIFT LIMIT] User ${r} exceeded weekly limit. Current: ${w}, Attempting: ${s}, Limit: ${E}`),await e.env.DB.prepare(`
        INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).bind(r,m,s,t,w,E).run(),e.json({error:`Weekly gift limit reached! You can only gift ${E} tokens per week. You have gifted ${w} tokens this week. Remaining: ${y} tokens`,weeklyLimit:E,weeklyGifted:w,weeklyRemaining:y,limitExceeded:!0},400);const R=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(o)),k=Array.from(new Uint8Array(R)).map(Ir=>Ir.toString(16).padStart(2,"0")).join(""),D=await e.env.DB.prepare(`
      SELECT pin, tokens, username FROM users WHERE id = ?
    `).bind(r).first();if(!D)return e.json({error:"User not found"},404);if(!D.pin)return e.json({error:"Please set a PIN first"},400);if(D.pin!==k)return e.json({error:"Invalid PIN"},401);const U=D.tokens||0;if(U<s)return e.json({error:`Insufficient tokens. You have ${U} tokens`},400);const I=await e.env.DB.prepare(`
      SELECT username, tokens FROM users WHERE id = ?
    `).bind(t).first();if(!I)return e.json({error:"Recipient not found"},404);console.log(`[TOKEN GIFT] ${D.username} sending ${s} tokens to ${I.username} (Weekly: ${w+s}/${E})`);const Z=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens - ? WHERE id = ?
    `).bind(s,r).run();console.log(`[TOKEN GIFT] Deducted ${s} tokens from sender`);const ee=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens + ? WHERE id = ?
    `).bind(s,t).run();console.log(`[TOKEN GIFT] Added ${s} tokens to receiver`);const L=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO token_transactions (id, from_user_id, to_user_id, amount, room_id, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(L,r,t,s,n||null,a||null).run(),console.log(`[TOKEN GIFT] Transaction recorded: ${L}`);const N=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(N,t,"token_gift","🎁 Token Gift Received!",`${D.username} sent you ${s} tokens${a?": "+a:""}`,JSON.stringify({fromUserId:r,amount:s,message:a,transactionId:L})).run(),console.log("[TOKEN GIFT] Notification created for receiver");const x=w+s;await e.env.DB.prepare(`
      UPDATE weekly_gift_tracking 
      SET total_gifted = ?, gift_count = gift_count + 1, last_gift_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_week = ?
    `).bind(x,r,m).run(),console.log(`[WEEKLY GIFT TRACKING] Updated: ${x}/${E} tokens gifted this week`),await e.env.DB.prepare(`
      INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).bind(r,m,s,t,x,E).run();const A=U-s,H=(I.tokens||0)+s,ue=E-x;let Fe="";return ue<=30&&ue>0?Fe=` ⚠️ Only ${ue} tokens remaining this week!`:ue===0&&(Fe=" 🚫 Weekly gift limit reached!"),e.json({success:!0,message:`Successfully sent ${s} tokens to ${I.username}${Fe}`,transactionId:L,newBalance:A,receiverUsername:I.username,receiverBalance:H,fromUsername:D.username,weeklyGifted:x,weeklyLimit:E,weeklyRemaining:ue})}catch(r){return console.error("Gift tokens error:",r),e.json({error:"Failed to gift tokens",details:r.message},500)}});p.get("/api/tokens/weekly-gift-status/:userId",async e=>{try{const r=e.req.param("userId"),t=new Date,s=new Date(t.getFullYear(),0,1),n=Math.floor((t.getTime()-s.getTime())/(1440*60*1e3)),a=Math.ceil((n+s.getDay()+1)/7),o=`${t.getFullYear()}-${String(a).padStart(2,"0")}`,i=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),d=(i==null?void 0:i.config_value)||150,u=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(r,o).first(),c=(u==null?void 0:u.total_gifted)||0,m=(u==null?void 0:u.gift_count)||0,f=d-c;return e.json({success:!0,yearWeek:o,weeklyLimit:d,totalGifted:c,remaining:f,giftCount:m,lastGiftAt:(u==null?void 0:u.last_gift_at)||null,limitReached:c>=d,percentageUsed:Math.round(c/d*100)})}catch(r){return console.error("Get weekly gift status error:",r),e.json({error:"Failed to get weekly gift status"},500)}});p.get("/api/tokens/history/:userId",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
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
    `).bind(r,r).all();return e.json({success:!0,transactions:t||[]})}catch(r){return console.error("Get token history error:",r),e.json({error:"Failed to get token history"},500)}});p.get("/api/rooms/:roomId/members",async e=>{try{const r=e.req.param("roomId"),{results:t}=await e.env.DB.prepare(`
      SELECT DISTINCT u.id, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY u.username
    `).bind(r).all();return e.json({success:!0,members:t||[]})}catch(r){return console.error("Get room members error:",r),e.json({error:"Failed to get room members"},500)}});p.get("/api/notifications/:userId",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(r).all();return e.json({success:!0,notifications:t||[]})}catch(r){return console.error("Get notifications error:",r),e.json({error:"Failed to get notifications"},500)}});p.post("/api/notifications/:notificationId/read",async e=>{try{const r=e.req.param("notificationId");return await e.env.DB.prepare(`
      UPDATE notifications SET read = 1 WHERE id = ?
    `).bind(r).run(),e.json({success:!0})}catch(r){return console.error("Mark notification read error:",r),e.json({error:"Failed to mark notification as read"},500)}});p.get("/api/notifications/:userId/unread-count",async e=>{try{const r=e.req.param("userId"),t=await e.env.DB.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `).bind(r).first();return e.json({success:!0,count:(t==null?void 0:t.count)||0})}catch(r){return console.error("Get unread count error:",r),e.json({error:"Failed to get unread count"},500)}});p.get("/api/notifications/:userId/unread",async e=>{try{const r=e.req.param("userId"),{results:t}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(r).all();return e.json({success:!0,notifications:t||[]})}catch(r){return console.error("Get unread notifications error:",r),e.json({error:"Failed to get unread notifications"},500)}});p.get("/api/data/plans",async e=>{try{const r=e.req.query("network");let t="SELECT * FROM data_plans WHERE active = 1";const s=[];r&&(t+=" AND network = ?",s.push(r)),t+=" ORDER BY token_cost ASC";const n=await e.env.DB.prepare(t).bind(...s).all();return e.json({success:!0,data:n.results||[]})}catch(r){return console.error("Get data plans error:",r),e.json({error:"Failed to get data plans"},500)}});p.post("/api/data/redeem",async e=>{var r,t,s,n,a,o,i;try{const{userId:d,planCode:u,phoneNumber:c}=await e.req.json();if(!d||!u||!c)return e.json({error:"User ID, plan code, and phone number required"},400);if(!/^0[789][01]\d{8}$/.test(c))return e.json({error:"Invalid Nigerian phone number format"},400);const f=await e.env.DB.prepare(`
      SELECT * FROM data_plans WHERE plan_code = ? AND active = 1
    `).bind(u).first();if(!f)return e.json({error:"Data plan not found"},404);const E=await e.env.DB.prepare(`
      SELECT tokens, email, phone_number FROM users WHERE id = ?
    `).bind(d).first();if(!E)return e.json({error:"User not found"},404);if(E.tokens<f.token_cost)return e.json({error:"Insufficient tokens",required:f.token_cost,current:E.tokens},400);const _=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO data_redemptions (
        user_id, phone_number, network, data_plan, 
        data_amount, token_cost, status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(d,c,f.network,f.plan_code,f.data_amount,f.token_cost,_).run(),await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens - ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `).bind(f.token_cost,f.token_cost,d).run();let w="pending",y=null,R=null;const k=e.env.VTPASS_API_KEY,D=e.env.VTPASS_PUBLIC_KEY,U=e.env.VTPASS_SECRET_KEY,I=e.env.VTPASS_BASE_URL||"https://sandbox.vtpass.com/api";if(k&&D&&U)try{const L={MTN:"mtn-data",Airtel:"airtel-data",Glo:"glo-data","9mobile":"etisalat-data"}[f.network]||"mtn-data",N=`SCPAY-${Date.now()}-${Math.floor(Math.random()*1e4)}`;console.log(`[VTPASS] Purchasing ${f.data_amount} ${f.network} data for ${c}`);const x=await fetch(`${I}/pay`,{method:"POST",headers:{"api-key":k,"secret-key":U,"Content-Type":"application/json"},body:JSON.stringify({request_id:N,serviceID:L,billersCode:c,variation_code:f.plan_code,amount:parseInt(f.variation_amount||"0"),phone:c})});if(!x.ok)throw new Error(`VTPass API error: ${x.status} ${x.statusText}`);const A=await x.json();console.log(`[VTPASS] Response code: ${A.code}, status: ${(t=(r=A.content)==null?void 0:r.transactions)==null?void 0:t.status}`);const H=(a=(n=(s=A.content)==null?void 0:s.transactions)==null?void 0:n.status)==null?void 0:a.toLowerCase();H==="delivered"||H==="successful"?w="completed":H==="failed"||H==="reversed"?(w="failed",R=A.response_description||"Transaction failed"):w="pending",y=((i=(o=A.content)==null?void 0:o.transactions)==null?void 0:i.transactionId)||N,console.log(`[VTPASS] Transaction ${_} status: ${w}`)}catch(ee){console.error("[VTPASS] API error:",ee),w="failed",R=ee.message||"VTPass API error",await e.env.DB.prepare(`
          UPDATE users 
          SET tokens = tokens + ?,
              total_spent = total_spent - ?
          WHERE id = ?
        `).bind(f.token_cost,f.token_cost,d).run(),console.log(`[VTPASS] Refunded ${f.token_cost} tokens to user ${d} due to API error`)}else console.log("[DATA REDEMPTION] DEMO MODE - VTPass API keys not configured"),w="completed",y="DEMO-"+Date.now();await e.env.DB.prepare(`
      UPDATE data_redemptions 
      SET status = ?,
          api_reference = ?,
          error_message = ?,
          completed_at = ?
      WHERE transaction_id = ?
    `).bind(w,y,R,w!=="pending"?new Date().toISOString():null,_).run(),console.log(`[DATA REDEMPTION] User ${d} redeemed ${f.data_amount} ${f.network} data for ${f.token_cost} tokens`),await e.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'data_redeemed', 'Data Redeemed!', ?)
    `).bind(d,`${f.data_amount} ${f.network} data sent to ${c}`).run();const Z=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(d).first();return e.json({success:!0,transactionId:_,message:`${f.data_amount} data will be sent to ${c} shortly`,newBalance:(Z==null?void 0:Z.tokens)||0,redemption:{network:f.network,dataAmount:f.data_amount,phoneNumber:c,status:w}})}catch(d){return console.error("Data redemption error:",d),e.json({error:"Failed to redeem data"},500)}});p.get("/api/data/history/:userId",async e=>{try{const r=e.req.param("userId"),t=parseInt(e.req.query("limit")||"20"),s=await e.env.DB.prepare(`
      SELECT 
        id, phone_number, network, data_amount, 
        token_cost, status, transaction_id, created_at
      FROM data_redemptions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(r,t).all();return e.json({success:!0,history:s.results||[]})}catch(r){return console.error("Get redemption history error:",r),e.json({error:"Failed to get history"},500)}});p.get("/api/data/status/:transactionId",async e=>{try{const r=e.req.param("transactionId"),t=await e.env.DB.prepare(`
      SELECT * FROM data_redemptions WHERE transaction_id = ?
    `).bind(r).first();return t?e.json({success:!0,status:t.status,details:t}):e.json({error:"Transaction not found"},404)}catch(r){return console.error("Get redemption status error:",r),e.json({error:"Failed to get status"},500)}});p.post("/api/ads/register-advertiser",async e=>{try{const{businessName:r,email:t,phone:s,instagramHandle:n,websiteUrl:a}=await e.req.json();if(!r||!t)return e.json({error:"Business name and email required"},400);if(await e.env.DB.prepare(`
      SELECT id FROM advertisers WHERE email = ?
    `).bind(t).first())return e.json({error:"Email already registered"},409);const i=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO advertisers (id, business_name, email, phone, instagram_handle, website_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(i,r,t,s||null,n||null,a||null).run(),console.log(`[ADS] Advertiser registered: ${r}`),e.json({success:!0,advertiserId:i,message:"Advertiser registered successfully"})}catch(r){return console.error("[ADS] Registration error:",r),e.json({error:"Registration failed"},500)}});p.post("/api/ads/login-advertiser",async e=>{try{const{email:r}=await e.req.json();if(!r)return e.json({error:"Email required"},400);const t=await e.env.DB.prepare(`
      SELECT id, business_name, email, phone, instagram_handle, website_url, created_at
      FROM advertisers WHERE email = ?
    `).bind(r).first();return t?(console.log(`[ADS] Advertiser logged in: ${r}`),e.json({success:!0,advertiserId:t.id,businessName:t.business_name,email:t.email,phone:t.phone,instagramHandle:t.instagram_handle,websiteUrl:t.website_url,message:"Login successful"})):e.json({error:"Account not found. Please register first."},404)}catch(r){return console.error("[ADS] Login error:",r),e.json({error:"Login failed"},500)}});p.post("/api/ads/create-campaign",async e=>{try{const{advertiserId:r,campaignName:t,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:d,pricingModel:u,budgetTotal:c,startDate:m,endDate:f}=await e.req.json();if(!r||!t||!s||!n||!o||!u||!c)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!d)return e.json({error:"Website URL required for website destination"},400);if(c<2e3)return e.json({error:"Minimum budget is ₦2,000"},400);const E=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO ad_campaigns (
        id, advertiser_id, campaign_name, 
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(E,r,t,s,n,a||null,o,i||null,d||null,u,c,m||new Date().toISOString(),f||null).run(),console.log(`[ADS] Campaign created: ${t} by advertiser ${r}`),e.json({success:!0,campaignId:E,message:"Campaign created and activated!",status:"active"})}catch(r){return console.error("[ADS] Campaign creation error:",r),e.json({error:"Campaign creation failed"},500)}});p.put("/api/ads/update-campaign/:campaignId",async e=>{try{const r=e.req.param("campaignId"),{campaignName:t,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:d,budgetTotal:u}=await e.req.json(),c=await e.env.DB.prepare(`
      SELECT id, advertiser_id, budget_spent FROM ad_campaigns WHERE id = ?
    `).bind(r).first();if(!c)return e.json({error:"Campaign not found"},404);if(!t||!s||!n||!o)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!d)return e.json({error:"Website URL required for website destination"},400);if(u&&u<c.budget_spent)return e.json({error:`Budget cannot be less than already spent (₦${c.budget_spent})`},400);const m=[],f=[];return t&&(m.push("campaign_name = ?"),f.push(t)),s&&(m.push("ad_image_url = ?"),f.push(s)),n&&(m.push("ad_title = ?"),f.push(n)),a!==void 0&&(m.push("ad_description = ?"),f.push(a||null)),o&&(m.push("destination_type = ?"),f.push(o)),i!==void 0&&(m.push("instagram_handle = ?"),f.push(i||null)),d!==void 0&&(m.push("website_url = ?"),f.push(d||null)),u&&(m.push("budget_total = ?"),f.push(u)),f.push(r),await e.env.DB.prepare(`
      UPDATE ad_campaigns 
      SET ${m.join(", ")}
      WHERE id = ?
    `).bind(...f).run(),console.log(`[ADS] Campaign updated: ${r}`),e.json({success:!0,campaignId:r,message:"Campaign updated successfully!"})}catch(r){return console.error("[ADS] Campaign update error:",r),e.json({error:"Campaign update failed"},500)}});p.post("/api/ads/campaign/:campaignId/status",async e=>{try{const r=e.req.param("campaignId"),{status:t}=await e.req.json();return["active","paused"].includes(t)?await e.env.DB.prepare(`
      SELECT id, campaign_name FROM ad_campaigns WHERE id = ?
    `).bind(r).first()?(await e.env.DB.prepare(`
      UPDATE ad_campaigns SET status = ? WHERE id = ?
    `).bind(t,r).run(),console.log(`[ADS] Campaign ${t}: ${r}`),e.json({success:!0,campaignId:r,status:t,message:`Campaign ${t==="active"?"resumed":"paused"} successfully!`})):e.json({error:"Campaign not found"},404):e.json({error:'Invalid status. Use "active" or "paused"'},400)}catch(r){return console.error("[ADS] Campaign status update error:",r),e.json({error:"Status update failed"},500)}});p.get("/api/ads/campaign/:campaignId",async e=>{try{const r=e.req.param("campaignId"),t=await e.env.DB.prepare(`
      SELECT 
        id, advertiser_id, campaign_name,
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total, budget_spent,
        impressions, clicks, status,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(r).first();return t?e.json({success:!0,campaign:t}):e.json({error:"Campaign not found"},404)}catch(r){return console.error("[ADS] Get campaign error:",r),e.json({error:"Failed to fetch campaign"},500)}});p.get("/api/ads/active",async e=>{try{const r=e.req.query("userId"),t=await e.env.DB.prepare(`
      SELECT 
        id, ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, impressions, clicks
      FROM ad_campaigns
      WHERE status = 'active'
        AND budget_spent < budget_total
      ORDER BY RANDOM()
      LIMIT 1
    `).first();return t?e.json({success:!0,ad:t}):e.json({success:!0,ad:null,message:"No active ads"})}catch(r){return console.error("[ADS] Get active ads error:",r),e.json({error:"Failed to get ads"},500)}});p.post("/api/ads/impression",async e=>{try{const{campaignId:r,userId:t,sessionId:s}=await e.req.json();if(!r)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
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
    `).bind(i,o,r).run(),e.json({success:!0,impressionRecorded:!0}))}catch(r){return console.error("[ADS] Impression tracking error:",r),e.json({error:"Failed to track impression"},500)}});p.post("/api/ads/click",async e=>{try{const{campaignId:r,userId:t,sessionId:s}=await e.req.json();if(!r)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
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
    `).bind(i,o,r).run();let d="";return n.destination_type==="instagram"?d=`https://instagram.com/${n.instagram_handle}`:d=n.website_url,e.json({success:!0,clickRecorded:!0,destinationUrl:d})}catch(r){return console.error("[ADS] Click tracking error:",r),e.json({error:"Failed to track click"},500)}});p.get("/api/ads/campaign/:campaignId/analytics",async e=>{try{const r=e.req.param("campaignId"),t=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        pricing_model, cpm_rate, cpc_rate,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(r).first();if(!t)return e.json({error:"Campaign not found"},404);const s=t.impressions>0?(t.clicks/t.impressions*100).toFixed(2):0,n=t.clicks>0?(t.budget_spent/t.clicks).toFixed(2):0,a=t.budget_total-t.budget_spent,o=(t.budget_spent/t.budget_total*100).toFixed(1);return e.json({success:!0,campaign:{...t,metrics:{ctr:`${s}%`,avgCostPerClick:`₦${n}`,budgetRemaining:`₦${a.toFixed(2)}`,percentSpent:`${o}%`}}})}catch(r){return console.error("[ADS] Analytics error:",r),e.json({error:"Failed to get analytics"},500)}});p.get("/api/ads/advertiser/:advertiserId/campaigns",async e=>{try{const r=e.req.param("advertiserId"),t=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE advertiser_id = ?
      ORDER BY created_at DESC
    `).bind(r).all();return e.json({success:!0,campaigns:t.results||[]})}catch(r){return console.error("[ADS] Get campaigns error:",r),e.json({error:"Failed to get campaigns"},500)}});p.post("/api/contacts/request",async e=>{try{const r=e.req.header("X-User-Email"),t=await e.req.json(),s=t.contact_id||t.contactId,n=t.user_id||t.userId;if(!r&&!n||!s)return e.json({error:"User ID and contact ID required"},400);let a;if(n?a=await e.env.DB.prepare("SELECT id, username FROM users WHERE id = ?").bind(n).first():a=await e.env.DB.prepare("SELECT id, username FROM users WHERE email = ?").bind(r).first(),!a)return e.json({error:"User not found"},404);const o=await e.env.DB.prepare(`
      SELECT status FROM user_contacts 
      WHERE user_id = ? AND contact_user_id = ?
    `).bind(a.id,s).first();if(o){if(o.status==="accepted")return e.json({error:"Already contacts"},400);if(o.status==="pending")return e.json({error:"Contact request already sent"},400);if(o.status==="blocked")return e.json({error:"Cannot send contact request"},403)}return await e.env.DB.prepare(`
      INSERT INTO user_contacts (user_id, contact_user_id, status, created_at)
      VALUES (?, ?, 'pending', datetime('now'))
    `).bind(a.id,s).run(),await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(crypto.randomUUID(),s,"contact_request","New Contact Request",`${a.username||"Someone"} wants to connect with you`,JSON.stringify({requester_id:a.id,requester_username:a.username})).run(),console.log(`[CONTACTS] Request sent from ${a.id} to ${s}`),e.json({success:!0,message:"Contact request sent"})}catch(r){return console.error("[CONTACTS] Request error:",r),e.json({error:"Failed to send contact request"},500)}});p.post("/api/contacts/accept",async e=>{try{const r=e.req.header("X-User-Email"),{requester_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and requester ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!s)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
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
    `).bind(crypto.randomUUID(),t,"contact_accepted","Contact Request Accepted",`${(n==null?void 0:n.username)||"Someone"} accepted your contact request`).run(),console.log(`[CONTACTS] Request accepted: ${t} <-> ${s.id}`),e.json({success:!0,message:"Contact request accepted"})}catch(r){return console.error("[CONTACTS] Accept error:",r),e.json({error:"Failed to accept contact request"},500)}});p.post("/api/contacts/reject",async e=>{try{const r=e.req.header("X-User-Email"),{requester_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and requester ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,s.id).run(),console.log(`[CONTACTS] Request rejected: ${t} -> ${s.id}`),e.json({success:!0,message:"Contact request rejected"})):e.json({error:"User not found"},404)}catch(r){return console.error("[CONTACTS] Reject error:",r),e.json({error:"Failed to reject contact request"},500)}});p.get("/api/contacts/requests",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"User email required"},400);const t=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, uc.created_at
      FROM user_contacts uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.contact_user_id = ? AND uc.status = 'pending'
      ORDER BY uc.created_at DESC
    `).bind(t.id).all();return e.json({requests:s.results||[]})}catch(r){return console.error("[CONTACTS] Get requests error:",r),e.json({error:"Failed to get contact requests"},500)}});p.get("/api/contacts",async e=>{try{const r=e.req.header("X-User-Email");if(!r)return e.json({error:"User email required"},400);const t=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();if(!t)return e.json({error:"User not found"},404);const s=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.online_status, u.last_seen
      FROM user_contacts uc
      JOIN users u ON uc.contact_user_id = u.id
      WHERE uc.user_id = ? AND uc.status = 'accepted'
      ORDER BY u.username ASC
    `).bind(t.id).all();return e.json({contacts:s.results||[]})}catch(r){return console.error("[CONTACTS] Get contacts error:",r),e.json({error:"Failed to get contacts"},500)}});p.delete("/api/contacts/:contactId",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("contactId");if(!r||!t)return e.json({error:"User email and contact ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(s.id,t).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,s.id).run(),console.log(`[CONTACTS] Removed contact: ${s.id} <-> ${t}`),e.json({success:!0,message:"Contact removed"})):e.json({error:"User not found"},404)}catch(r){return console.error("[CONTACTS] Remove error:",r),e.json({error:"Failed to remove contact"},500)}});p.post("/api/users/block",async e=>{try{const r=e.req.header("X-User-Email"),{user_id:t,reason:s}=await e.req.json();if(!r||!t)return e.json({error:"User email and target user ID required"},400);const n=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return n?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO blocked_users (user_id, blocked_user_id, blocked_at, reason)
      VALUES (?, ?, datetime('now'), ?)
    `).bind(n.id,t,s||null).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(n.id,t).run(),await e.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(t,n.id).run(),console.log(`[BLOCK] User ${n.id} blocked ${t}`),e.json({success:!0,message:"User blocked"})):e.json({error:"User not found"},404)}catch(r){return console.error("[BLOCK] Block error:",r),e.json({error:"Failed to block user"},500)}});p.delete("/api/users/block/:userId",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("userId");if(!r||!t)return e.json({error:"User email and blocked user ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM blocked_users WHERE user_id = ? AND blocked_user_id = ?
    `).bind(s.id,t).run(),console.log(`[BLOCK] User ${s.id} unblocked ${t}`),e.json({success:!0,message:"User unblocked"})):e.json({error:"User not found"},404)}catch(r){return console.error("[BLOCK] Unblock error:",r),e.json({error:"Failed to unblock user"},500)}});p.post("/api/users/status",async e=>{try{const r=e.req.header("X-User-Email"),{status:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and status required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      UPDATE users 
      SET online_status = ?, last_seen = datetime('now')
      WHERE id = ?
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[STATUS] Update error:",r),e.json({error:"Failed to update status"},500)}});p.get("/api/rooms/:roomId/online",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, u.online_status
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ? 
        AND u.online_status = 'online'
        AND u.last_seen >= datetime('now', '-2 minutes')
      ORDER BY u.username
    `).bind(r).all();return e.json({online:t.results||[]})}catch(r){return console.error("[STATUS] Get online error:",r),e.json({error:"Failed to get online users"},500)}});p.post("/api/typing/start",async e=>{try{const r=e.req.header("X-User-Email"),{room_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and room ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO typing_status (room_id, user_id, started_at)
      VALUES (?, ?, datetime('now'))
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[TYPING] Start error:",r),e.json({error:"Failed to start typing"},500)}});p.post("/api/typing/stop",async e=>{try{const r=e.req.header("X-User-Email"),{room_id:t}=await e.req.json();if(!r||!t)return e.json({error:"User email and room ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      DELETE FROM typing_status WHERE room_id = ? AND user_id = ?
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[TYPING] Stop error:",r),e.json({error:"Failed to stop typing"},500)}});p.get("/api/typing/:roomId",async e=>{try{const r=e.req.param("roomId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar
      FROM typing_status ts
      JOIN users u ON ts.user_id = u.id
      WHERE ts.room_id = ? AND ts.started_at >= datetime('now', '-5 seconds')
    `).bind(r).all();return e.json({typing:t.results||[]})}catch(r){return console.error("[TYPING] Get error:",r),e.json({error:"Failed to get typing users"},500)}});p.post("/api/messages/:messageId/read",async e=>{try{const r=e.req.header("X-User-Email"),t=e.req.param("messageId");if(!r||!t)return e.json({error:"User email and message ID required"},400);const s=await e.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(r).first();return s?(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO message_receipts (message_id, user_id, read_at)
      VALUES (?, ?, datetime('now'))
    `).bind(t,s.id).run(),e.json({success:!0})):e.json({error:"User not found"},404)}catch(r){return console.error("[RECEIPTS] Mark read error:",r),e.json({error:"Failed to mark message as read"},500)}});p.get("/api/messages/:messageId/receipts",async e=>{try{const r=e.req.param("messageId"),t=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, mr.read_at
      FROM message_receipts mr
      JOIN users u ON mr.user_id = u.id
      WHERE mr.message_id = ?
      ORDER BY mr.read_at ASC
    `).bind(r).all();return e.json({receipts:t.results||[]})}catch(r){return console.error("[RECEIPTS] Get receipts error:",r),e.json({error:"Failed to get read receipts"},500)}});p.post("/api/profile/nickname",async e=>{try{const{userId:r,targetUserId:t,roomId:s,nickname:n}=await e.req.json();if(!r||!n)return e.json({error:"User ID and nickname required"},400);const a=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO custom_nicknames (id, user_id, target_user_id, room_id, nickname, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, target_user_id, room_id) 
      DO UPDATE SET nickname = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(a,r,t||null,s||null,n,n).run(),e.json({success:!0,nickname:n})}catch(r){return console.error("[PROFILE] Set nickname error:",r),e.json({error:"Failed to set nickname"},500)}});p.get("/api/profile/nickname/:userId/:targetUserId",async e=>{try{const r=e.req.param("userId"),t=e.req.param("targetUserId"),s=await e.env.DB.prepare(`
      SELECT nickname FROM custom_nicknames 
      WHERE user_id = ? AND target_user_id = ?
    `).bind(r,t).first();return e.json({nickname:(s==null?void 0:s.nickname)||null})}catch(r){return console.error("[PROFILE] Get nickname error:",r),e.json({error:"Failed to get nickname"},500)}});p.post("/api/profile/mute",async e=>{try{const{userId:r,roomId:t,duration:s}=await e.req.json();if(!r||!t)return e.json({error:"User ID and room ID required"},400);const n=s===-1?"2099-12-31 23:59:59":new Date(Date.now()+s*1e3).toISOString();return await e.env.DB.prepare(`
      INSERT INTO muted_chats (user_id, room_id, muted_until, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, room_id) 
      DO UPDATE SET muted_until = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(r,t,n,n).run(),e.json({success:!0,mutedUntil:n})}catch(r){return console.error("[PROFILE] Mute chat error:",r),e.json({error:"Failed to mute chat"},500)}});p.get("/api/profile/mute/:userId/:roomId",async e=>{try{const r=e.req.param("userId"),t=e.req.param("roomId"),s=await e.env.DB.prepare(`
      SELECT muted_until FROM muted_chats 
      WHERE user_id = ? AND room_id = ? AND muted_until > CURRENT_TIMESTAMP
    `).bind(r,t).first();return e.json({isMuted:!!s,mutedUntil:(s==null?void 0:s.muted_until)||null})}catch(r){return console.error("[PROFILE] Check mute error:",r),e.json({error:"Failed to check mute status"},500)}});p.delete("/api/profile/mute/:userId/:roomId",async e=>{try{const r=e.req.param("userId"),t=e.req.param("roomId");return await e.env.DB.prepare(`
      DELETE FROM muted_chats WHERE user_id = ? AND room_id = ?
    `).bind(r,t).run(),e.json({success:!0})}catch(r){return console.error("[PROFILE] Unmute chat error:",r),e.json({error:"Failed to unmute chat"},500)}});p.get("/api/profile/media/:roomId",async e=>{try{const r=e.req.param("roomId"),t=e.req.query("type")||"all";let s="";t==="photos"?s="AND json_extract(file_metadata, '$.type') LIKE 'image/%'":t==="videos"?s="AND json_extract(file_metadata, '$.type') LIKE 'video/%'":t==="files"&&(s="AND json_extract(file_metadata, '$.type') NOT LIKE 'image/%' AND json_extract(file_metadata, '$.type') NOT LIKE 'video/%'");const n=await e.env.DB.prepare(`
      SELECT 
        m.id, m.sender_id, m.file_metadata, m.created_at,
        u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? AND m.is_file = 1 ${s}
      ORDER BY m.created_at DESC
      LIMIT 100
    `).bind(r).all();return e.json({media:n.results||[]})}catch(r){return console.error("[PROFILE] Get media error:",r),e.json({error:"Failed to get media"},500)}});p.get("/api/profile/search/:roomId",async e=>{try{const r=e.req.param("roomId"),t=e.req.query("q")||"";if(!t||t.length<2)return e.json({results:[]});const s=await e.env.DB.prepare(`
      SELECT 
        m.id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
        u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? 
      ORDER BY m.created_at DESC
      LIMIT 50
    `).bind(r).all();return e.json({results:s.results||[]})}catch(r){return console.error("[PROFILE] Search error:",r),e.json({error:"Failed to search messages"},500)}});p.post("/api/profile/group/update",async e=>{try{const{roomId:r,userId:t,roomName:s,description:n,avatar:a}=await e.req.json();if(!r||!t)return e.json({error:"Room ID and user ID required"},400);const o=await e.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(r).first();return!o||o.created_by!==t?e.json({error:"Only group admin can update info"},403):(await e.env.DB.prepare(`
      UPDATE rooms 
      SET room_name = ?, description = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(s,n||null,a||null,r).run(),e.json({success:!0}))}catch(r){return console.error("[PROFILE] Update group error:",r),e.json({error:"Failed to update group"},500)}});p.post("/api/profile/group/permissions",async e=>{try{const{roomId:r,userId:t,permission:s,value:n}=await e.req.json();if(!r||!t||!s)return e.json({error:"Missing required fields"},400);const a=await e.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(r).first();return!a||a.created_by!==t?e.json({error:"Only group admin can change permissions"},403):(await e.env.DB.prepare(`
      INSERT INTO group_permissions (room_id, permission_type, permission_value, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(room_id, permission_type) 
      DO UPDATE SET permission_value = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(r,s,n,n).run(),e.json({success:!0}))}catch(r){return console.error("[PROFILE] Set permissions error:",r),e.json({error:"Failed to set permissions"},500)}});p.get("/api/profile/group/permissions/:roomId",async e=>{var r;try{const t=e.req.param("roomId"),s=await e.env.DB.prepare(`
      SELECT permission_type, permission_value 
      FROM group_permissions 
      WHERE room_id = ?
    `).bind(t).all(),n={messages:"everyone",add_members:"admins",edit_info:"admins"};return(r=s.results)==null||r.forEach(a=>{n[a.permission_type]=a.permission_value}),e.json({permissions:n})}catch(t){return console.error("[PROFILE] Get permissions error:",t),e.json({error:"Failed to get permissions"},500)}});p.post("/api/profile/group/privacy",async e=>{try{const{roomId:r,userId:t,privacy:s}=await e.req.json();if(!r||!t||!s)return e.json({error:"Missing required fields"},400);const n=await e.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(r).first();return!n||n.created_by!==t?e.json({error:"Only group admin can change privacy"},403):(await e.env.DB.prepare(`
      UPDATE rooms SET privacy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(s,r).run(),e.json({success:!0}))}catch(r){return console.error("[PROFILE] Set privacy error:",r),e.json({error:"Failed to set privacy"},500)}});p.post("/api/profile/report/user",async e=>{try{const{reporterId:r,reportedUserId:t,reason:s,description:n}=await e.req.json();if(!r||!t||!s)return e.json({error:"Missing required fields"},400);const a=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO reports (id, reporter_id, reported_user_id, reason, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(a,r,t,s,n||null).run(),e.json({success:!0,reportId:a})}catch(r){return console.error("[PROFILE] Report user error:",r),e.json({error:"Failed to report user"},500)}});p.post("/api/profile/report/group",async e=>{try{const{reporterId:r,roomId:t,reason:s,description:n}=await e.req.json();if(!r||!t||!s)return e.json({error:"Missing required fields"},400);const a=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO reports (id, reporter_id, reported_room_id, reason, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(a,r,t,s,n||null).run(),e.json({success:!0,reportId:a})}catch(r){return console.error("[PROFILE] Report group error:",r),e.json({error:"Failed to report group"},500)}});p.delete("/api/profile/clear/:userId/:roomId",async e=>{try{const r=e.req.param("userId"),t=e.req.param("roomId");return await e.env.DB.prepare(`
      INSERT INTO deleted_messages (user_id, message_id)
      SELECT ?, id FROM messages WHERE room_id = ?
    `).bind(r,t).run(),e.json({success:!0})}catch(r){return console.error("[PROFILE] Clear chat error:",r),e.json({error:"Failed to clear chat"},500)}});p.get("/api/profile/export/:roomId",async e=>{var r,t;try{const s=e.req.param("roomId");console.log(`[EXPORT] Exporting chat for room: ${s}`);const n=await e.env.DB.prepare(`
      SELECT 
        m.id, m.encrypted_content, m.iv, m.is_file, m.file_metadata, m.created_at,
        u.username, u.id as sender_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at ASC
    `).bind(s).all();return console.log(`[EXPORT] Found ${((r=n.results)==null?void 0:r.length)||0} messages`),e.json({success:!0,messages:n.results||[],messageCount:((t=n.results)==null?void 0:t.length)||0,exportedAt:new Date().toISOString()})}catch(s){return console.error("[PROFILE] Export chat error:",s),e.json({error:"Failed to export chat",details:s.message},500)}});p.get("*",e=>e.req.path.startsWith("/api/")||e.req.path.startsWith("/static/")?e.notFound():e.html(`
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
        
        <script src="/static/crypto-v2.js?v=NOTIF-FIX-V2"><\/script>
        <script src="/static/app-v3.js?v=COMPACT-BUBBLE-USERNAME"><\/script>
        <script>
            const app = new SecureChatApp();
            app.init();
        <\/script>
    </body>
    </html>
  `));const ze=new _r,wt=Object.assign({"/src/index.tsx":p});let Rr=!1;for(const[,e]of Object.entries(wt))e&&(ze.all("*",r=>{let t;try{t=r.executionCtx}catch{}return e.fetch(r.req.raw,r.env,t)}),ze.notFound(r=>{let t;try{t=r.executionCtx}catch{}return e.fetch(r.req.raw,r.env,t)}),Rr=!0);if(!Rr)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{ze as default};
