import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './MockPaymentModal.css';
export default function MockPaymentModal({amount,orderName,buyer,method,onClose,onPay}:{amount:number;orderName:string;buyer:{name:string;email:string};method:string;onClose:()=>void;onPay:()=>Promise<void>}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{previous?.focus();};},[]);
  return createPortal(<dialog ref={dialog} className="mock-payment" aria-labelledby="mock-payment-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <div className="mock-payment-header"><h2 id="mock-payment-title">결제하기</h2><button type="button" aria-label="닫기" disabled={busy} onClick={onClose}>×</button></div>
    <div className="mock-payment-body"><p className="mock-payment-notice">모의 결제입니다. 실제 금액은 청구되지 않습니다.</p><dl><dt>주문명</dt><dd>{orderName}</dd><dt>결제금액</dt><dd><strong>{amount.toLocaleString('ko-KR')} 원</strong></dd><dt>결제수단</dt><dd>{method==='TOSS'?'toss pay':'PAYCO'} (모의)</dd></dl>
    <h3>카드 정보</h3><div className="mock-payment-grid">{[['카드번호','1234 5678 9012 3456'],['유효기간(YY/MM)','29/12'],['CVC','***'],['비밀번호 앞 2자리','**']].map(([label,value])=><label key={label}>{label}<input value={value} readOnly aria-describedby="mock-card-note"/></label>)}</div><p id="mock-card-note">테스트용 가상 정보입니다. 실제 카드정보를 입력할 필요가 없습니다.</p>
    <h3>구매자</h3><div className="mock-payment-grid"><label>이름<input readOnly value={buyer.name}/></label><label>이메일<input readOnly value={buyer.email}/></label></div>{error&&<p role="alert">{error}</p>}</div>
    <div className="mock-payment-footer"><button type="button" disabled={busy} onClick={onClose}>취소</button><button type="button" className="mock-payment-primary" disabled={busy} onClick={async()=>{if(busy)return;setBusy(true);setError('');try{await onPay();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{busy?'결제 중…':'모의 결제하기'}</button></div>
  </dialog>,document.body);
}
