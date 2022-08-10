var jpdbBaseURL='http://api.login2explore.com:5577';
var jpdbIRL='/api/irl';
var jpdbIML='/api/iml';
var empDBName='EMP-DB';
var empRelationName="EmpData";
var connToken="90939240|-31949294347911379|90942489";

function saveRecordNo2LS(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("recno",data.rec_no);
}

function initEmpForm(){
    localStorage.removeItem("first_rec");
    localStorage.removeItem("last_rec");
    localStorage.removeItem("rec_no");
    console.log("init_form() done");
}

function newData(){
    $("#empid").val("");
    $("#empname").val("");
    $("#empsal").val("");
    $("#hra").val("");
    $("#da").val("");
    $("#deduct").val("");
    disableForm(false);
    $("#empid").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save").prop("disabled",false);
    $("#reset").prop("disabled",false);    
}

function saveData(){
    var jsonStrObj=validateData();
    if(jsonStrObj===""){
        return "";
    }
    var putRequest=createPUTRequest(connToken,jsonStrObj,empDBName,empRelationName);
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommandAtGivenBaseUrl(putRequest,jpdbBaseURL,jpdbIML);
    jQuery.ajaxSetup({async:true});
    setLastRecord(resJsonObj);
    setRecentRecord(resJsonObj);
    resetData();    
}

function editData(){
    disableForm(false);
    $("#empid").prop("disabled",true);
    $("#empname").focus();
    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled",false);
    $("#reset").prop("disabled",false);
}

function changeData(){
    jsonChange=validateData();
    var updateRequest=createUPDATERecordRequest(connToken,jsonChange,empDBName,empRelationName,parseInt($("#empid").val()));
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommandAtGivenBaseUrl(updateRequest,jpdbBaseURL,jpdbIML);
    jQuery.ajaxSetup({async:true});
    resetData();   
    $("#empid").focus();
    $("#edit").focus();
}

function resetData(){
    disableCtrl(true);
    disableNav(false);

    var getRequest=createGET_BY_RECORDRequest(connToken,empDBName,empRelationName,localStorage.getItem("rec_no"));
    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getRequest,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    fillData(result);
    $("#new").prop("disabled",false);
}

function validateData(){
    var empid,empname,empsal,hra,da,deduct;
    empid=$("#empid").val();
    empname=$("#empname").val();
    empsal=$("#empsal").val();
    hra=$("#hra").val();
    da=$("#da").val();
    deduct=$("#deduct").val();

    if(empid===""){
        alert("Employee ID Missing");
        $("#empid").focus();
        return "";
    }
    if(empname===""){
        alert("Employee Name Missing");
        $("#empname").focus();
        return "";
    }
    if(empsal===""){
        alert("Employee Salary Missing");
        $("#empsal").focus();
        return "";
    }
    if(hra===""){
        alert("HRA Missing");
        $("#hra").focus();
        return "";
    }
    if(da===""){
        alert("DA Missing");
        $("#da").focus();
        return "";
    }
    if(deduct===""){
        alert("Deduct Missing");
        $("#deduct").focus();
        return "";
    }
    var jsonStrObj={
        id:empid,
        name:empname,
        salary:empsal,
        hra:hra,
        da:da,
        deduction:deduct
    };
    return JSON.stringify(jsonStrObj);
}

function getEmpIdJsonStr(){
    var empid=$("#empid").val();
    var jsonStr={
        id:empid
    };
    return JSON.stringify(jsonStr);
}

function getEmp(){
    var empIdJsonStr=getEmpIdJsonStr();
    getData(empIdJsonStr);
}

function getData(empIdJsonStr){
    var putReqStr=createGET_BY_KEYRequest(connToken,empDBName,empRelationName,empIdJsonStr);
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommandAtGivenBaseUrl(putReqStr,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    if(resJsonObj.status===400){
        $("#save").prop("disabled",false);
        $("#reset").prop("disabled",false);
        $("#empname").focus();        
    }
    else if(resJsonObj.status===200){
        $("#empid").prop("disabled",true);
        fillData(resJsonObj);
        $("#change").prop("disabled",false);
        $("#reset").prop("disabled",false);
        $("#empname").focus();
    }
}

function fillData(jsonObj){
    if(jsonObj.status===400){
        console.log("status failed");
        return;
    }
    var record=(JSON.parse(jsonObj.data)).record;
    setRecentRecord(jsonObj);
    $("#empid").val(record.id);
    $("#empname").val(record.name);
    $("#empsal").val(record.salary);
    $("#hra").val(record.hra);
    $("#da").val(record.da);
    $("#deduct").val(record.deduction);   

    disableNav(false);
    disableForm(true);
    $("#save").prop("disabled",true);
    $("#change").prop("disabled",true);
    $("#reset").prop("disabled",true);
    $("#new").prop("disabled",false);
    $("#edit").prop("disabled",false);

    if(localStorage.getItem("rec_no")===localStorage.getItem("first_rec")){
        $("#prev").prop("disabled",true);
        $("#first").prop("disabled",true);
    }
    if(localStorage.getItem("rec_no")===localStorage.getItem("last_no")){
        $("#next").prop("disabled",true);
        $("#last").prop("disabled",true);        
    }
}

function getFirst(){
    var getFirstRequest=createFIRST_RECORDRequest(connToken,empDBName,empRelationName);

    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getFirstRequest,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:true});

    fillData(result);
    setFirstRecord(result);
    $("#empid").prop("disabled",true);
    $("#first").prop("disabled",true);
    $("#prev").prop("disabled",true);
    $("#save").prop("disabled",true);
    $("#next").prop("disabled",false);
    $("#last").prop("disabled",false);
}

function getPrev(){
    var rec=localStorage.getItem("rec_no");
    var getPrevRequest=createPREV_RECORDRequest(connToken,empDBName,empRelationName,rec);
    jQuery.ajaxSetup({async:false});
    var result=executeRequest=executeCommandAtGivenBaseUrl(getPrevRequest,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:false});
    fillData(result);
    var r=localStorage.getItem("rec_no");
    if(r==1){
        $("#first").prop("disabled",true);
        $("#prev").prop("disabled",true);
    }
    $("#save").prop("disabled",true);
}

function getNext(){
    var rec=localStorage.getItem("rec_no");
    var getNextRequest=createNEXT_RECORDRequest(connToken,empDBName,empRelationName,rec);
    jQuery.ajaxSetup({async:false});
    var result=executeRequest=executeCommandAtGivenBaseUrl(getNextRequest,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:false});
    fillData(result);
    //var r=localStorage.getItem("rec_no");
    if(result===localStorage.getItem("last_rec")){
        $("#last").prop("disabled",true);
        $("#next").prop("disabled",true);
    }
    $("#save").prop("disabled",true);
}

function getLast(){
    var getLastRequest=createLAST_RECORDRequest(connToken,empDBName,empRelationName);
    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getLastRequest,jpdbBaseURL,jpdbIRL);
    jQuery.ajaxSetup({async:true});

    setLastRecord(result);
    fillData(result);
    $("#first").prop("disabled",false);
    $("#prev").prop("disabled",false);
    $("#save").prop("disabled",true);
    $("#next").prop("disabled",true);
    $("#last").prop("disabled",true);

}

function setRecentRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("rec_no",data.rec_no);
}

function setFirstRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("first_no",data.rec_no);
}

function setLastRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("last_no",data.rec_no);
}

function setRecords(){
    if(localStorage.getItem("first_rec")===undefined){
        localStorage.setItem("first_rec","0");
    }
    if(localStorage.getItem("last_rec")===undefined){
        localStorage.setItem("last_rec","0");
    }
}

function disableNav(ctrl){
    $("#first").prop("disabled",ctrl);
    $("#prev").prop("disabled",ctrl);
    $("#next").prop("disabled",ctrl);
    $("#last").prop("disabled",ctrl);
}

function disableCtrl(ctrl){
    $("#new").prop("disabled",ctrl);
    $("#save").prop("disabled",ctrl);
    $("#edit").prop("disabled",ctrl);
    $("#change").prop("disabled",ctrl);
    $("#reset").prop("disabled",ctrl);    
}

function disableForm(ctrl){
    $("#empid").prop("disabled",ctrl);
    $("#empname").prop("disabled",ctrl);
    $("#empsal").prop("disabled",ctrl);
    $("#hra").prop("disabled",ctrl);
    $("#da").prop("disabled",ctrl);
    $("#deduct").prop("disabled",ctrl);    
}

function checkForNoOrOneRecord(){
    if(localStorage.getItem("first_rec")==="0"){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled",false);
        return;
    }
    if(localStorage.getItem("first_rec")===localStorage.getItem("last_rec")){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled",false);
        $("#edit").prop("disabled",false);
        return;
    }
}

initEmpForm();
getFirst();
getLast();
setRecords();
checkForNoOrOneRecord();