export function validateRegistration(body) {
  const {id,password,passwordConfirm,name,email,phone,zip,addr1,addr2='',nickname='',birth='',gender='',agree_terms,agree_privacy,agree_sms=false,agree_email=false}=body;
  const invalid=message=>({error:message});
  if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{4,16}$/.test(id)) return invalid('아이디는 영문·숫자·밑줄·하이픈 4~16자로 입력해 주세요.');
  if(typeof password!=='string'||password.length<8||password.length>128) return invalid('비밀번호는 8~128자로 입력해 주세요.');
  if(password!==passwordConfirm) return invalid('비밀번호가 일치하지 않습니다.');
  if(typeof name!=='string'||!name.trim()||name.length>100) return invalid('이름을 입력해 주세요.');
  if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)) return invalid('이메일 주소를 확인해 주세요.');
  if(typeof phone!=='string'||!/^\d{10,11}$/.test(phone)) return invalid('휴대전화번호는 숫자 10~11자로 입력해 주세요.');
  if(typeof zip!=='string'||!/^\d{5}$/.test(zip)||typeof addr1!=='string'||!addr1.trim()||addr1.length>50||typeof addr2!=='string'||addr2.length>100) return invalid('우편번호와 주소를 확인해 주세요.');
  if(typeof nickname!=='string'||nickname.length>12||!['','남','여'].includes(gender)) return invalid('닉네임과 성별을 확인해 주세요.');
  if(typeof birth!=='string') return invalid('생년월일을 확인해 주세요.');
  if(birth) {
    const date=new Date(birth+'T00:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(birth)||Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==birth||date>new Date()) return invalid('올바른 생년월일을 선택해 주세요.');
  }
  if(agree_terms!==true||agree_privacy!==true) return invalid('필수 이용약관과 개인정보 수집·이용에 동의해 주세요.');
  if(typeof agree_sms!=='boolean'||typeof agree_email!=='boolean') return invalid('정보 수신 동의 값을 확인해 주세요.');
  return {profile:{nickname,phone,birth,gender,zip,addr1:addr1.trim(),addr2,agree_terms:true,agree_privacy:true,agree_sms,agree_email,consented_at:new Date().toISOString()}};
}
