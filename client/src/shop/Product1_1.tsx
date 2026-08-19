import "./Product1_1.css"; 
import Header from "../main/Header";
import Footer from "../main/Footer";

import airMeshImg from "../assets/living/1-1. airMesh/airMesh.png";
import airMeshDescImg from "../assets/living/1-1. airMesh/airMesh_Desc1.png";

const Product1_1 = () => {

  return (
    <div className="airMesh_wrap">
      <div className="airMesh_Header">
        <Header />  
      </div>      {/** airMesh_Header end */}
      
      <div className="airMesh_body">
        <div id="detail">
          <div className="detail_top_wrap">
            {/** 상품 이미지 */}
            <div className="prdimg">
              <div id="addimg" className="addimg">
                <div className="add_img">
                  <img src={airMeshImg} alt="매쉬 쿨매트" />  
                </div>     {/** add_img end */}  

                <div className="detail_info">
                  <div className="img_wrapper" style={{ textAlign: "center" }}>
                    <img src={airMeshDescImg} />
                  </div>    {/** img_wrapper end */}
                  <div style={{ textAlign: "center" }}><br /></div>  
                </div>     {/** detail_info end */}
              </div>    {/** addimg end */}  

              <div className="related_wrap">
                <div className="btn_bottom dn">
                  <span className="box_btn w141 left">
                    <a href="#">선택상품 장바구니</a>
                  </span>		{/** box_btn w141 end */}
                  <span className="box_btn w141">
                    <a href="#">선택상품 구매</a>	
                  </span>		{/** box_btn w141 end */}
                </div>		{/** btn_bottom dn end */}
              </div>		{/** related_wrap end */}
            </div>    {/** prdimg end */}  

            {/** 상품정보 */}
            <div className="info_scroll">
              <form name="prdFrm" method="post" style={{ margin: "0px" }} acceptCharset="utf-8">
                <div className="wrap_prd">
                  {/** 상품정보 & 버튼 */}
                  <div className="info">
                    <h3 className="name">에어메쉬 순면 쿨매트</h3>  
                    <p className="summary">(주)국민유통 · 리빙용품</p>
                    <div className="price">
                      <div className="top_price">
                        <span className="consumer consumerY">43,900 원</span>      {/** consumer consumerY end */}
                        <span className="sell sellY">
                          <strong>39,510</strong>  
                        </span>      {/** sell sellY end */}  
                      </div>     {/** top_price end */}  

                      <span className="discount discountY">
                        <strong>39,510</strong>  
                      </span>      {/** discount discountY end */}
                      <span className="per">10%</span>     {/** per end */}
                    </div>     {/** price end */}

                    {/** 상품옵션리스트 */}
                    <div className="opt_list">
                      <div className="th">수량</div>
                      <div className="td">
                        <select>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>  
                      </div>  
                    </div>      {/** opt_list end */}

                    {/** 상품옵션리스트 - 종류 (데이터가 있을 때만 노출) */}
                    <div className="opt_list"></div>      {/** opt_list end */}

                    {/** 세부종류 : 종류를 선택했을 때만 노출 */}
                    <div className="opt_list">
                      <div className="th">종류</div>      {/** th end */}
                      <div className="td">
                        <select>
                          <option value="">::선택하세요::</option>
                          <option value="1">에어메쉬 순면 쿨패드</option>  
                        </select>  
                      </div>  
                    </div>      {/** opt_list end */}

                    {/** 수량 */}
                    <div className="box_qty hidden">
                      <input type="text" name="buy_ea" value={1} className="form_input" />
                      <div className="btn_ea">
                        <a href="#" className="ea_up">+</a>
                        <a href="#" className="ea_down">-</a>  
                      </div>      {/** btn ea */} 
                    </div>      {/** box_qty hidden end */}

                    <table className="list">
                      <colgroup>
                        <col style={{ width: "30%" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row">MILEAGE</th>
                          <td>
                            <div className="box_info">
                              <div className="info">회원적립금 : 878 원</div>      {/** info end */}  
                            </div>    {/** box_info end */}  
                          </td>  
                        </tr>  
                      </tbody>  
                    </table>      {/** list end */}

                    <div className="multi_opt"></div>     {/** multi_opt end */}

                    {/** 버튼 */}
                    <div className="btn">
                      <span className="box btn large buy block">
                        <a href="#">결제하기</a>  
                      </span>   {/** box btn large buy block end */} 

                      {/** 찜하기 */}
                      <span className=""></span>     
                    </div>     {/** btn end */}
                  </div>      {/** info end */}  
                </div>      {/** wrap_prd end */}
              </form>
            </div>     {/** info_scroll end */}
          </div>   {/** detail_top_wrap end */}  
        </div>     {/** detail end */}
      </div>        {/** airMesh_body end */}

      <div className="airMesh_Footer">
        <Footer />  
      </div>      {/** airMesh_Footer end */}
    </div>      /** airMesh_wrap end */
  );
};

export default Product1_1;