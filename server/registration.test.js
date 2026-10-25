import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRegistration} from './registration.js';
const valid={id:'test_user',password:'password123',passwordConfirm:'password123',name:'테스트',email:'test@example.invalid',phone:'01012345678',zip:'12345',addr1:'테스트 주소',agree_terms:true,agree_privacy:true};
test('all form fields and optional opt-outs survive validation without passwords',()=>{
  const result=validateRegistration({...valid,nickname:'별명',birth:'2000-02-29',gender:'여',agree_sms:true});
  assert.equal(result.profile.birth,'2000-02-29');assert.equal(result.profile.agree_email,false);assert.equal(result.profile.agree_sms,true);assert.equal(result.profile.nickname,'별명');assert.equal('password' in result.profile,false);
});
test('missing consent, mismatched passwords and invalid date are rejected',()=>{
  for(const data of [{agree_terms:false},{agree_privacy:false},{passwordConfirm:'different'},{birth:'2001-02-29'},{birth:'2000-01-'},{email:'invalid'},{phone:'123'},{zip:'123'},{id:'bad id'},{name:null},{agree_sms:'true'}]) assert.ok(validateRegistration({...valid,...data}).error,JSON.stringify(data));
});
