type Address = { zonecode:string; address:string };
type PostcodeApi = { Postcode:new (options:{oncomplete:(address:Address)=>void})=>{open:()=>void} };
declare global { interface Window { kakao?:PostcodeApi; daum?:PostcodeApi } }
let loading:Promise<void>|undefined;
export async function searchPostcode(oncomplete:(address:Address)=>void) {
  if(!window.kakao?.Postcode&&!window.daum?.Postcode) {
    loading??=new Promise<void>((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload=()=>resolve();script.onerror=()=>{loading=undefined;reject(new Error('주소 검색을 불러오지 못했습니다. 주소를 직접 입력해 주세요.'));};document.head.appendChild(script);
    });await loading;
  }
  const api=window.kakao?.Postcode?window.kakao:window.daum;
  if(!api)throw Error('주소 검색 서비스를 이용할 수 없습니다.');
  new api.Postcode({oncomplete}).open();
}
