import TermsContent from "./TermsContent";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { searchPostcode } from "../lib/postcode";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({    // 서버 페이지에 전달할 폼값명 
    id: "",
    password: "",
    name: "",
    passwordConfirm: "",
    birth1: "", birth2: "", birth3: "",
    age: "",
    gender2: "",
    email: "",
    nickname: "",
    phone: "",
    birth: "",
    gender: "",
    zip: "",
    addr1: "",
    addr2: "",
    agree_terms: false,
    agree_privacy: false,
    agree_sms: false,
    agree_email: false,
  });

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestedNext = params.get("next") || "/cart";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\") ? requestedNext : "/cart";

  // 폼(input 요소들)의 상태를 변경할 때 사용하는 함수
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // 사용자가 변경한 '<input>' 요소의 속성들을 꺼냄 
    // e.target : 이벤트가 발생한 input 요소 
    // name : input의 name 속성 
    // value : 텍스트나 숫자 input에 입력한 값 
    // type : input의 타입 
    // checked : 체크박스일 경우 'true' 또는 'false' 
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
  
    if (name === "all_check") {
      // 전체동의일 경우 모든 체크박스 항목을 한꺼번에 갱신
      setFormData((prev) => ({
        ...prev,
        agree_terms: checked,   // 해당 항목이 자동 체크표시됨 
        agree_privacy: checked,
        agree_sms: checked,
        agree_email: checked,
      }));
    } else {
      // 개별 항목 변경
      setFormData((prev) => ({
        ...prev,    // prev : 이전 formData 상태 
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if(busy) return;
    setError("");
    if(!formData.agree_terms || !formData.agree_privacy) { setError("이용약관과 개인정보 수집·이용에 동의해 주세요."); return; }
    if(formData.password !== formData.passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    const parts=[formData.birth1,formData.birth2,formData.birth3];
    if(parts.some(Boolean) && !parts.every(Boolean)) { setError("생년월일을 모두 선택해 주세요."); return; }
    setBusy(true);
    try {
      await apiRequest("/auth/register", {method:"POST",body:{...formData,birth:parts.every(Boolean)?parts.join("-"):""}});
      navigate(next,{replace:true});
    } catch(err) { setError(err instanceof Error?err.message:"회원가입에 실패했습니다."); }
    finally { setBusy(false); }
  };

  return (
    <div className="wrapper_register soulpaw-register">
      <div className="register">
        <h1 className="logo">
          <Link to="/" className="recypro">소울포우</Link>
          {/** <a href="../main/Home.jsx">리싸이프로</a> */}
        </h1>
        
        {/** 중간내용 */}
        <div className="registerJoin">
          <div className="registerBody">
          <h2 className="subtitle">회원정보 입력</h2>

          <div id="join_input">
            <form name="joinFrm" method="post" onSubmit={handleSubmit}>
              <input type="hidden" name="exec_file" value="" />
              <input type="hidden" name="member_id_checked" value="0" />
              <input type="hidden" name="nick_checked" value="0" />
              <input type="hidden" name="namecheck_num" value="" />
              <input type="hidden" name="ipin_num" value="" />
              <input type="hidden" name="member_type" value="1" />
              <input type="hidden" name="reg_data" value="" />

              <fieldset>
                <div className="all_chk">
                  <p className="check">
                    <label>
                      <input type="checkbox" name="all_check" value="Y" className="all_check" checked={formData.agree_terms && formData.agree_privacy && formData.agree_sms && formData.agree_email} onChange={handleChange} />전체동의
                    </label>
                  </p>    {/** check end */}
                </div>    {/** all_chk end */}
                <legend>이용 약관</legend>
                <div className="box join_box join_box0">
                  <label>
                    <input type="checkbox" required name="agree_terms" checked={formData.agree_terms} onChange={handleChange} value="Y" className="join_check" />이용약관
                  </label>
                  <div className="cont_box">
                    <div className="terms-document" role="region" aria-label="이용약관 전문" tabIndex={0}><TermsContent /></div>
                  </div>    {/** cont_box end */}
                </div>      {/** box join_box join_box0 */}

                <div className="box join_box join_box1">
                  <label>
                    <input type="checkbox" required name="agree_privacy" checked={formData.agree_privacy} onChange={handleChange} value="Y" className="join_check" />개인정보처리방침
                  </label>
                  <div className="cont_box">
                    <table className="tbl_row">
                      <caption className="hidden">개인정보 수집·이용 동의</caption>
                      <colgroup>
                        <col style={{ width: "20%" }} />
                        <col />
                      </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row">수집하는 개인정보 항목</th>
                        <td>이름 , 로그인ID , 비밀번호 , 자택 전화번호 , 자택 주소 , 휴대전화번호 , 이메일</td>
                      </tr>
                      <tr>
                        <th scope="row">수집 및 이용목적</th>
                        <td>회원제 서비스 이용에 따른 본인확인 , 개인 식별 , 불량회원의 부정 이용 방지와 비인가 사용 방지 , 가입 의사 확인 , 불만처리 등 민원처리 , 고지사항 전달</td>
                      </tr>
                      <tr>
                        <th scope="row">보유 및 이용기간</th>
                        <td>
                          회원탈퇴 단, 관계 법령에 따라 개인정보를 보존해야 하는 경우, 회사는 해당 법령에서 정한 기간동안 보관합니다.<br />
                          ※ 동의를 거부할 수 있으나 거부 시 회원가입이 불가능합니다.
                        </td>
                        </tr>
                      </tbody>
                    </table>  
                  </div>     {/** cont_box end */}
              </div>    {/** box join_box join_box1 end */}
            </fieldset>

            <input type="hidden" name="setOpenSSL" value="Y" />
            <fieldset>
              <legend>기본정보입력 <span><strong>*</strong> 필수 입력 항목</span></legend>
              <div className="box">
                <div className="required">
                  <label htmlFor="join_id">아이디</label>
                  <div className="input_area">
                    <input type="text" required pattern="[a-zA-Z0-9_-]{4,16}" title="영문·숫자·밑줄·하이픈 4~16자" autoComplete="username" name="id" value={formData.id} maxLength={16} onChange={handleChange} placeholder="아이디" id="join_id" className="form_input block" />
                  </div>    {/** input_area end */}
                  <div className="msg">
                    <p className="form_result form_result_member_id warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** required end */}
    
                <div className="required">
                  <label htmlFor="join_email">이메일</label>
                  <div className="input_area">
                    <input type="email" required onChange={handleChange} autoComplete="email" name="email" value={formData.email} id="join_email" className="form_input block" />
                    <div className="auto_complete_email auto_complete_dialog"></div>
                  </div>    {/** input_area end */}
                  <div className="msg">
                    <p className="form_result form_result_email warning"></p>
                  </div>  {/** msg end */}
                </div>    {/** required end */}

                <div className="pw1 required">
                  <label htmlFor="join_pw">비밀번호</label>
                  <div className="input_area">
                    <input type="password" required minLength={8} maxLength={128} autoComplete="new-password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" id="join_pw" className="form_input block" />
                    <div className="msg block">
                      <p className="form_result form_result_pwd1 warning"></p>
                    </div>    {/** msg block end */}
                  </div>    {/** input_area end */}

                  <div className="msg">
                    <div className="password_security_lev password_security_1" style={{ display: "none" }}>
                      비밀번호 안전도 <strong>낮음</strong> 
                      <span></span>
                      <p>안전도가 높은 비밀번호를 권장합니다.</p>
                    </div>    {/** password_security_lev password_security_1 end */}

                    <div className="password_security_lev password_security_2" style={{ display: "none" }}>
                      비밀번호 안전도 <strong>중간</strong> 
                      <span></span>
                      <p>안전도가 높은 비밀번호를 권장합니다.</p>
                    </div>    {/** password_security_lev password_security_2 end */}

                    <div className="password_security_lev password_security_3" style= {{ display: "none" }}>
                      비밀번호 안전도 <strong>높음</strong> 
                      <span></span>
                      <p>안전도가 높은 비밀번호를 권장합니다.</p>
                    </div>    {/** password_security_lev password_security_3 end */}
                  </div>    {/** msg end */}
                </div>    {/** pw1 required end */}

                <div className="pw2 required">
                  <label htmlFor="join_pw2">비밀번호 확인</label>
                  <div className="input_area">
                    <input type="password" required autoComplete="new-password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} id="join_pw2" className="form_input block" />
                    <div className="msg block">
                      <p className="form_result form_result_pwd2 warning"></p>
                    </div>    {/** msg block end */}
                  </div>    {/** input_area end */}
                </div>    {/** pw2 required end */}
              </div>    {/** box end */}

              <div className="box">
                <div className="required">
                  <label htmlFor="join_name">이름</label>
                  <div className="input_area">
                    <input type="text" required maxLength={100} autoComplete="name" name="name" value={formData.name} onChange={handleChange} placeholder="이름" id="join_name" className="form_input block" />
                  </div>    {/** input_area end */}
                  <div className="msg">
                    <p className="form_result form_result_name warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** required end */}

                <div className="">
                  <label htmlFor="join_nick">닉네임</label>
                  <div className="input_area">
                    <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="닉네임" maxLength={12} id="join_nick" className="form_input block" />
                  </div>    {/** input_area end */}
                  <div className="msg">
                    <p className="form_result form_result_nick warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** "" end */}

                <div className="required">
                  <label htmlFor="join_cell">휴대전화번호</label>
                  <div className="input_area">
                    <input type="text" required pattern="[0-9]{10,11}" autoComplete="tel" name="phone" value={formData.phone} onChange={handleChange} id="join_cell" className="form_input block remove_dash" placeholder="(-) 없이 번호만 입력" />
                  </div>
                </div>    {/** required end */}

                <div className="birth ">
                  <label>생년월일</label>
                  <div className="input_area">
                    <select aria-label="생년" name="birth1" value={formData.birth1} onChange={handleChange}>
                      <option value="">Year</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                      <option value="2016">2016</option>
                      <option value="2015">2015</option>
                      <option value="2014">2014</option>
                      <option value="2013">2013</option>
                      <option value="2012">2012</option>
                      <option value="2011">2011</option>
                      <option value="2010">2010</option>
                      <option value="2009">2009</option>
                      <option value="2008">2008</option>
                      <option value="2007">2007</option>
                      <option value="2006">2006</option>
                      <option value="2005">2005</option>
                      <option value="2004">2004</option>
                      <option value="2003">2003</option>
                      <option value="2002">2002</option>
                      <option value="2001">2001</option>
                      <option value="2000">2000</option>
                      <option value="1999">1999</option>
                      <option value="1998">1998</option>
                      <option value="1997">1997</option>
                      <option value="1996">1996</option>
                      <option value="1995">1995</option>
                      <option value="1994">1994</option>
                      <option value="1993">1993</option>
                      <option value="1992">1992</option>
                      <option value="1991">1991</option>
                      <option value="1990">1990</option>
                      <option value="1989">1989</option>
                      <option value="1988">1988</option>
                      <option value="1987">1987</option>
                      <option value="1986">1986</option>
                      <option value="1985">1985</option>
                      <option value="1984">1984</option>
                      <option value="1983">1983</option>
                      <option value="1982">1982</option>
                      <option value="1981">1981</option>
                      <option value="1980">1980</option>
                      <option value="1979">1979</option>
                      <option value="1978">1978</option>
                      <option value="1977">1977</option>
                      <option value="1976">1976</option>
                      <option value="1975">1975</option>
                      <option value="1974">1974</option>
                      <option value="1973">1973</option>
                      <option value="1972">1972</option>
                      <option value="1971">1971</option>
                      <option value="1970">1970</option>
                      <option value="1969">1969</option>
                      <option value="1968">1968</option>
                      <option value="1967">1967</option>
                      <option value="1966">1966</option>
                      <option value="1965">1965</option>
                      <option value="1964">1964</option>
                      <option value="1963">1963</option>
                      <option value="1962">1962</option>
                      <option value="1961">1961</option>
                      <option value="1960">1960</option>
                      <option value="1959">1959</option>
                      <option value="1958">1958</option>
                      <option value="1957">1957</option>
                      <option value="1956">1956</option>
                      <option value="1955">1955</option>
                      <option value="1954">1954</option>
                      <option value="1953">1953</option>
                      <option value="1952">1952</option>
                      <option value="1951">1951</option>
                      <option value="1950">1950</option>  
                    </select>

                    <select aria-label="생월" name="birth2" value={formData.birth2} onChange={handleChange}>
                      <option value="">Month</option>
                      <option value="01">01</option>
                      <option value="02">02</option>
                      <option value="03">03</option>
                      <option value="04">04</option>
                      <option value="05">05</option>
                      <option value="06">06</option>
                      <option value="07">07</option>
                      <option value="08">08</option>
                      <option value="09">09</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>

                    <select aria-label="생일" name="birth3" value={formData.birth3} onChange={handleChange}>
                      <option value="">Day</option>
                      <option value="01">01</option>
                      <option value="02">02</option>
                      <option value="03">03</option>
                      <option value="04">04</option>
                      <option value="05">05</option>
                      <option value="06">06</option>
                      <option value="07">07</option>
                      <option value="08">08</option>
                      <option value="09">09</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                      <option value="13">13</option>
                      <option value="14">14</option>
                      <option value="15">15</option>
                      <option value="16">16</option>
                      <option value="17">17</option>
                      <option value="18">18</option>
                      <option value="19">19</option>
                      <option value="20">20</option>
                      <option value="21">21</option>
                      <option value="22">22</option>
                      <option value="23">23</option>
                      <option value="24">24</option>
                      <option value="25">25</option>
                      <option value="26">26</option>
                      <option value="27">27</option>
                      <option value="28">28</option>
                      <option value="29">29</option>
                      <option value="30">30</option>
                      <option value="31">31</option>
                    </select>
                  </div>    {/** input_area end */}

                  <div className="msg">
                    <p className="form_result form_result_birth warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** birth  end */}

                <div className="">
                  <label>성별</label>
                  <div className="input_area radio_chg">
                    <input type="radio" name="gender" value="남" checked={formData.gender === "남"} onChange={handleChange} id="sex_male" />
                    <label htmlFor="sex_male">남</label>
                    <input type="radio" name="gender" value="여" checked={formData.gender === "여"} onChange={handleChange} id="sex_female" />
                    <label htmlFor="sex_female">여</label>
                  </div>    {/** input_are radio_chg end */}

                  <div className="msg">
                    <p className="form_result form_result_sex warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** "" end */}

                <div className="addr required">
                  <label htmlFor="join_address">주소</label>
                  <div className="input_area">
                    <input type="text" required pattern="[0-9]{5}" name="zip" value={formData.zip} onChange={handleChange} placeholder="우편번호" id="join_address" className="form_input block"  />
                    <span className="box_btn gray2">
                      <button type="button" className="check" onClick={()=>searchPostcode(data=>setFormData(f=>({...f,zip:data.zonecode,addr1:data.address}))).catch(err=>setError(err.message))}>우편번호 찾기</button>
                    </span>
                    <input type="text" required aria-label="기본 주소" name="addr1" value={formData.addr1} onChange={handleChange} placeholder="주소1" maxLength={50} className="form_input block"  />
                    <input type="text" aria-label="상세 주소" name="addr2" value={formData.addr2} onChange={handleChange} placeholder="주소2" maxLength={100} className="form_input block" />
                  </div>    {/** input_area end */}

                  <div className="msg">
                    <p className="form_result form_result_addr warning"></p>
                  </div>    {/** msg end */}
                </div>    {/** addr required end */}
              </div>    {/** box end */}

              <div className="box">
                <div className="required">
                  <label className="vt">이벤트 정보 수신</label>
                  <div className="input_area check_chg">
                    <input type="checkbox" name="agree_sms" checked={formData.agree_sms} onChange={handleChange} value="Y" id="join_sms" />
                    <label htmlFor="join_sms">SMS 정보 수신 <strong>(문자메시지/ 카카오톡)</strong></label>
                    <input type="checkbox" name="agree_email" checked={formData.agree_email} onChange={handleChange} value="Y" id="join_mailing" />
                    <label htmlFor="join_mailing">이메일 정보 수신</label>
                    <p className="event_info">
                      <strong>쇼핑몰에서 제공하는 신상품 소식/할인쿠폰을 무상으로 보내드립니다.<br />
                      단, 상품 구매 정보는 수신동의 여부 관계없이 발송됩니다.<br />
                      제공 동의를 하지 않으셔도 서비스 이용에는 문제가 없습니다.</strong>
                    </p>    {/** event_info end */}
                  </div>    {/** input_area check_chg end */}
                </div>    {/** required end */}
              </div>     {/** box end */}
            </fieldset>

            {error && <p role="alert" className="register-error">{error}</p>}
            <div className="btn">
              <span className="box_btn w150 large strong">
                <input type="submit" disabled={busy} value={busy ? "가입 중…" : "확인"} />
              </span>
              <span className="box_btn w150 large white strong"><a href="/">취소</a></span>
            </div>    {/** btn end */}
          </form>
          
          <form id="ssl_tmp" method="post">
            <input type="hidden" name="exec_file" />
            <input type="hidden" name="setOpenSSL" value="Y" />
            <input type="hidden" name="data" />
          </form>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

