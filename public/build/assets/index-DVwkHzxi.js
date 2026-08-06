import{a as M,r as s,j as g}from"./app-C1abKyrx.js";import{M as H,q as b,u as A,P as q,t as T,w as U,L as S}from"./proxy-QnDWlc6r.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]],te=M("ArrowUpRight",W);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],ne=M("CircleHelp",D);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],se=M("Clock",K);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],oe=M("Compass",V);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],re=M("Layers",B);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=[["path",{d:"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"qn84l0"}],["path",{d:"M13 5v2",key:"dyzc3o"}],["path",{d:"M13 17v2",key:"1ont0d"}],["path",{d:"M13 11v2",key:"1wjjxi"}]],ie=M("Ticket",F);function P(e,o){if(typeof e=="function")return e(o);e!=null&&(e.current=o)}function G(...e){return o=>{let t=!1;const r=e.map(i=>{const n=P(i,o);return!t&&typeof n=="function"&&(t=!0),n});if(t)return()=>{for(let i=0;i<r.length;i++){const n=r[i];typeof n=="function"?n():P(e[i],null)}}}}function X(...e){return s.useCallback(G(...e),e)}class Z extends s.Component{getSnapshotBeforeUpdate(o){const t=this.props.childRef.current;if(t&&o.isPresent&&!this.props.isPresent){const r=t.offsetParent,i=b(r)&&r.offsetWidth||0,n=this.props.sizeRef.current;n.height=t.offsetHeight||0,n.width=t.offsetWidth||0,n.top=t.offsetTop,n.left=t.offsetLeft,n.right=i-n.width-n.left}return null}componentDidUpdate(){}render(){return this.props.children}}function J({children:e,isPresent:o,anchorX:t,root:r}){const i=s.useId(),n=s.useRef(null),h=s.useRef({width:0,height:0,top:0,left:0,right:0}),{nonce:x}=s.useContext(H),R=X(n,e==null?void 0:e.ref);return s.useInsertionEffect(()=>{const{width:c,height:y,top:a,left:f,right:p}=h.current;if(o||!n.current||!c||!y)return;const m=t==="left"?`left: ${f}`:`right: ${p}`;n.current.dataset.motionPopId=i;const u=document.createElement("style");x&&(u.nonce=x);const v=r??document.head;return v.appendChild(u),u.sheet&&u.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${c}px !important;
            height: ${y}px !important;
            ${m}px !important;
            top: ${a}px !important;
          }
        `),()=>{v.contains(u)&&v.removeChild(u)}},[o]),g.jsx(Z,{isPresent:o,childRef:n,sizeRef:h,children:s.cloneElement(e,{ref:R})})}const O=({children:e,initial:o,isPresent:t,onExitComplete:r,custom:i,presenceAffectsLayout:n,mode:h,anchorX:x,root:R})=>{const c=A(Q),y=s.useId();let a=!0,f=s.useMemo(()=>(a=!1,{id:y,initial:o,isPresent:t,custom:i,onExitComplete:p=>{c.set(p,!0);for(const m of c.values())if(!m)return;r&&r()},register:p=>(c.set(p,!1),()=>c.delete(p))}),[t,c,r]);return n&&a&&(f={...f}),s.useMemo(()=>{c.forEach((p,m)=>c.set(m,!1))},[t]),s.useEffect(()=>{!t&&!c.size&&r&&r()},[t]),h==="popLayout"&&(e=g.jsx(J,{isPresent:t,anchorX:x,root:R,children:e})),g.jsx(q.Provider,{value:f,children:e})};function Q(){return new Map}const w=e=>e.key||"";function z(e){const o=[];return s.Children.forEach(e,t=>{s.isValidElement(t)&&o.push(t)}),o}const ce=({children:e,custom:o,initial:t=!0,onExitComplete:r,presenceAffectsLayout:i=!0,mode:n="sync",propagate:h=!1,anchorX:x="left",root:R})=>{const[c,y]=T(h),a=s.useMemo(()=>z(e),[e]),f=h&&!c?[]:a.map(w),p=s.useRef(!0),m=s.useRef(a),u=A(()=>new Map),[v,I]=s.useState(a),[C,$]=s.useState(a);U(()=>{p.current=!1,m.current=a;for(let d=0;d<C.length;d++){const l=w(C[d]);f.includes(l)?u.delete(l):u.get(l)!==!0&&u.set(l,!1)}},[C,f.length,f.join("-")]);const E=[];if(a!==v){let d=[...a];for(let l=0;l<C.length;l++){const k=C[l],L=w(k);f.includes(L)||(d.splice(l,0,k),E.push(k))}return n==="wait"&&E.length&&(d=E),$(z(d)),I(a),null}const{forceRender:_}=s.useContext(S);return g.jsx(g.Fragment,{children:C.map(d=>{const l=w(d),k=h&&!c?!1:a===C||f.includes(l),L=()=>{if(u.has(l))u.set(l,!0);else return;let j=!0;u.forEach(N=>{N||(j=!1)}),j&&(_==null||_(),$(m.current),h&&(y==null||y()),r&&r())};return g.jsx(O,{isPresent:k,initial:!p.current||t?void 0:!1,custom:o,presenceAffectsLayout:i,mode:n,root:R,onExitComplete:k?void 0:L,anchorX:x,children:d},l)})})};export{te as A,oe as C,re as L,ie as T,ce as a,se as b,ne as c};
