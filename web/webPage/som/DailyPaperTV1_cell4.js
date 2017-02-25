/**
 * Created by wangc on 2017/2/24.
 */
$(function () {
    loadData('2017-02-23');
});
var saleContract_dom = document.getElementById("bar1");
var saleContract_instance = echarts.init(saleContract_dom);

// 初始本月销售合同option
var saleContract_instance_option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
    },
    yAxis: {
        type: 'category',
        data: ['已执行', '合同总量']
    },
    series: [
        {
            name: '本月销售合同',
            type: 'bar',
            data: [],
            itemStyle:{
                normal:
                    {
                        color:'#4990e2'
                    }
            }
        }
    ]
};

saleContract_instance.showLoading();

if (saleContract_instance_option && typeof saleContract_instance_option === "object") {
    saleContract_instance.setOption(saleContract_instance_option, true);
}


// 初始化本月客户合同执行饼状图
var customer_dom = document.getElementById("pie");
var customer_instance = echarts.init(customer_dom);
var customer_instance_option = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    series: [
        {
            name: '总计',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '50%'],

            label: {
                normal: {
                    position: 'inner'
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: []
        },
        {
            name: '客户',
            type: 'pie',
            radius: ['55%', '75%'],

            data: []
        }
    ]
};

if (customer_instance_option && typeof customer_instance_option === "object") {
    customer_instance.setOption(customer_instance_option, true);
}

// 初始化一程港柱状图
var one_dom = document.getElementById("bar2");
var one_instance = echarts.init(one_dom);

// 初始本月销售合同option
var one_instance_option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
    },
    yAxis: {
        type: 'category',
        data: []
    },
    series: [
        {
            name: '一程港',
            type: 'bar',
            data: [],
            itemStyle:{
                normal:
                    {
                        color:'#ffd44c'
                    }
            }
        }
    ]
};

one_instance.showLoading();

if (one_instance_option && typeof one_instance_option === "object") {
    one_instance.setOption(one_instance_option, true);
}

function loadData(date){
    var url = 'http://192.168.0.122:8082/som/rest/api/sysContractController/findSaleContractInfo?createTime=' + date + '&callback=?';
    $.ajax({
        url: url,
        dataType: 'jsonp',
        processData: false,
        type: 'get',
        success: function (data) {
            if (data.returnCode == 'success') {//后台返回正确的信息
                debugger
                var echart_data = JSON.parse(data.resultContent);
                set_saleContract_instance(echart_data);// 给本月销售合同赋值
                set_one_instance(echart_data);// 给一程港柱状图赋值
                set_customer_instance(echart_data);// 本月客户合同执行饼状图赋值
            } else {//后台返回失败的信息
                alert(data.message);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status);
            alert(XMLHttpRequest.readyState);
            alert(textStatus);
        }

    });
}



/**
 * 给本月销售合同柱状图赋值
 * @param echart_data
 */
function set_saleContract_instance(echart_data) {
    var executeWeight_sum = $.Add($.Add(echart_data.saleOneSum.executeWeight, echart_data.saleTwoSum.executeWeight), echart_data.saleTrainSum.executeWeight);
    var weight_sum = $.Add($.Add(echart_data.saleOneSum.weight, echart_data.saleTwoSum.weight), echart_data.saleTrainSum.weight);

    saleContract_instance.hideLoading();
    saleContract_instance.setOption({
        series: [{
            // 根据名字对应到相应的系列
            name: '本月销售合同',
            data: [executeWeight_sum, weight_sum]
        }]
    });
}

/**
 * 给一程港柱状图赋值
 * @param echart_data
 */
function set_one_instance(echart_data) {
    var customers = new Array();
    var executeWeights = new Array();

    for (var i = 0;i < echart_data.saleOneSum.saleOneBeans.length; i++){
        customers.push(echart_data.saleOneSum.saleOneBeans[i].customerName);
        executeWeights.push(echart_data.saleOneSum.saleOneBeans[i].executeWeight);
    }

    one_instance.hideLoading();
    one_instance.setOption({
        yAxis: {
            type: 'category',
            data: customers
        },
        series: [{
            // 根据名字对应到相应的系列
            name: '一程港',
            data: executeWeights
        }]
    });
}

/**
 * 本月客户合同执行饼状图赋值
 */
function set_customer_instance(echart_data) {
    debugger;
    // 内圆初始化
    var types = new Array();
    var one = new Object();
    one.name = "一港";
    one.value = echart_data.saleOneSum.executeWeight;

    var two = new Object();
    two.name = "二港";
    two.value = echart_data.saleTwoSum.executeWeight

    var train = new Object();
    train.name = "火车";
    train.value = echart_data.saleTrainSum.executeWeight;

    types.push(one);
    types.push(two);
    types.push(train);

    // 外圆初始化
    var customers = new Array();

    for (var i = 0; i < echart_data.saleOneSum.saleOneBeans.length; i++) {
        var obj = new Object();
        obj.name = echart_data.saleOneSum.saleOneBeans[i].customerName + "(" + echart_data.saleOneSum.saleOneBeans[i].executeWeight +")";
        obj.value = echart_data.saleOneSum.saleOneBeans[i].executeWeight;
        customers.push(obj);
    }

    for (var i = 0; i < echart_data.saleTwoSum.saleTwoBeans.length; i++) {
        var obj = new Object();
        obj.name = echart_data.saleTwoSum.saleTwoBeans[i].areaName + "(" + echart_data.saleTwoSum.saleTwoBeans[i].executeWeight +")";
        obj.value = echart_data.saleTwoSum.saleTwoBeans[i].executeWeight;
        customers.push(obj);
    }

    for (var i = 0; i < echart_data.saleTrainSum.saleTrainBeans.length; i++) {
        var obj = new Object();
        obj.name = echart_data.saleTrainSum.saleTrainBeans[i].customerName + "(" + echart_data.saleTrainSum.saleTrainBeans[i].executeWeight +")";
        obj.value = echart_data.saleTrainSum.saleTrainBeans[i].executeWeight;
        customers.push(obj);
    }

    customer_instance.hideLoading();
    customer_instance.setOption({
        series: [{
            // 根据名字对应到相应的系列
            name: '总计',
            data: types
        },
            {
                // 根据名字对应到相应的系列
                name: '客户',
                data: customers
            }
        ]
    });
}
