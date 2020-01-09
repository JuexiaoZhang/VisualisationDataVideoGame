
$(function () {

    function charts_overview(data) {
        var options = {
            chart: {
                zoomType: 'xy',
                backgroundColor:""
            },
            title: {
                text:'Game releases and sales in the last four decades',
            },
            credits: {
                enabled: false
            },
            xAxis: [{
                categories: data['years'] //years 'Jan', 'Feb',...
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}$',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Sales',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'Numbers',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 100,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor)
            },
            series: [{
                name: 'Numbers',
                type: 'column',
                yAxis: 1,
                data: data['numbers'],
                tooltip: {
                    valueSuffix: ' mm'
                }
            }, {
                name: 'Sales',
                type: 'spline',
                data: data['sales'],
                tooltip: {
                    valueSuffix: 'million €'
                }
            }],
            plotOptions:{
                series:{
                    point:{
                        events:{
                            click: function () {
                                var category = this.category;
                                $('.year').html(this.categories);

                                var year ={'year':category}
                                $.ajax({
                                    url:"http://127.0.0.1:5000/peiNumber",
                                    type: "POST",
                                    data:JSON.stringify(year),
                                    contentType:"application/json;charset=utf-8", //必须要设置
                                    async:true,
                                    dataType : "json",
                                    success: function (data2) {
                                        charts_peiNumbers(category,data2)
                                    },
                                    error:function () {
                                        alert("网络异常，请稍后再试！");
                                    }
                                })
                                $.ajax({
                                    url:"http://127.0.0.1:5000/peiSale",
                                    type: "POST",
                                    data:JSON.stringify(year),
                                    contentType:"application/json;charset=utf-8", //必须要设置
                                    async:true,
                                    dataType : "json",
                                    success: function (data2) {
                                        charts_peiSales(category,data2)
                                    },
                                    error:function () {
                                        alert("网络异常，请稍后再试！");
                                    }
                                })
                                $.ajax({
                                    url:"http://127.0.0.1:5000/wordcloud",
                                    type: "POST",
                                    data:JSON.stringify(year),
                                    contentType:"application/json;charset=utf-8", //必须要设置
                                    async:true,
                                    dataType : "json",
                                    success: function (data2) {
                                        charts_names(category,data2['text'])
                                    },
                                    error:function () {
                                        alert("网络异常，请稍后再试！");
                                    }
                                })
                                $.ajax({
                                    url:"http://127.0.0.1:5000/boxplotScore",
                                    type: "POST",
                                    data:JSON.stringify(year),
                                    contentType:"application/json;charset=utf-8", //必须要设置

                                    dataType : "json",
                                    success: function (data2) {
                                        charts_boxplotScore(category,data2)
                                    },
                                    error:function () {
                                        alert("网络异常，请稍后再试！");
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }
        var chart1 = new Highcharts.chart(document.getElementById('overview'),options)
    }
    
    function charts_peiNumbers(category,data) {
        Highcharts.getOptions().plotOptions.pie.colors = (function () {
            var colors = [],
                base = Highcharts.getOptions().colors[0],
                i;
            for (i = 0; i < 10; i += 1) {
                // Start out with a darkened base color (negative brighten), and end
                // up with a much brighter color
                colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
            }
            return colors;
        }());
        var options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                zoomType: 'xy',
                backgroundColor:""
            },
            title: {
                text: 'Number of games released in ' + category,
                style:{fontSize : '10px'},
                floating : true
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Region',
                colorByPoint: true,
                data: [{
                    name: 'North America',
                    y: data['NA']
                }, {
                    name: 'Europe',
                    y: data['EU']
                }, {
                    name: 'Japan',
                    y: data['JP']
                }, {
                    name: 'Others',
                    y: data['OT']
                }]
            }]
        }
        var myChart = Highcharts.chart(document.getElementById('fb1'),options);
    }

    function charts_peiSales(category,data) {
        Highcharts.getOptions().plotOptions.pie.colors = (function () {
            var colors = [],
                base = Highcharts.getOptions().colors[0],
                i;
            for (i = 0; i < 10; i += 1) {
                // Start out with a darkened base color (negative brighten), and end
                // up with a much brighter color
                colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
            }
            return colors;
        }());
        var options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                zoomType: 'xy',
                backgroundColor:""
            },
            title: {
                text: 'Sales of games released in ' + category,
                style:{fontSize : '10px'},
                floating : true
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: [{
                    name: 'North America',
                    y: data['NA']
                }, {
                    name: 'Europe',
                    y: data['EU']
                }, {
                    name: 'Japan',
                    y: data['JP']
                }, {
                    name: 'Others',
                    y: data['OT']
                }]
            }]
        }
        var myChart = Highcharts.chart(document.getElementById('fb2'),options);
    }

    function charts_names(category,text) {
        var text2 = text + ''
        var data = text2.split(/[,\.: =]+/g).reduce(function (arr, word) {
                var obj = arr.find(function (obj) {
                    if (obj.name!='of' && obj.name!='The' && obj.name!='the' && obj.name!='&'){
                        return obj.name === word;
                    }
                });
                if (obj) {
                    obj.weight += 1;
                } else {
                    obj = {
                        name: word,
                        weight: 1
                    };
                    arr.push(obj);
                }
                arr.sort(function (a,b) {
                    return b.weight - a.weight
                    })

                return arr.slice(0,10);
            }, []);
        var options = {
            chart:{
                zoomType: 'xy',
                backgroundColor:""
            },
            credits: {
                enabled: false
            },
            series: [{
                type: 'wordcloud',
                data: data
            }],
            title: {
                text: 'Words most used as game names in '+category,
                style:{fontSize : '10px'},
            }
        }
        var myChart = Highcharts.chart(document.getElementById('wordcloud'),options);
    }

    function charts_boxplotScore(category,data) {
        Highcharts.getOptions().plotOptions.pie.colors = (function () {
            var colors = [],
                base = Highcharts.getOptions().colors[0],
                i;
            for (i = 0; i < 10; i += 1) {
                // Start out with a darkened base color (negative brighten), and end
                // up with a much brighter color
                colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
            }
            return colors;
        }());
        var options = {
            chart: {
                type: 'boxplot',
                zoomType: 'xy',
                backgroundColor:""
            },
            title: {
                text: category +' Game Ratings by Category' ,
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled:false
            },
            xAxis: {
                categories: data['genre'],
                title: {
                    text: 'Category'
                }
            },
            yAxis: {
                max:10, // 定义Y轴 最大值
                min:0, // 定义最小值
                minPadding: 0.2,
                maxPadding: 0.2,
                tickInterval:0.5, // 刻度值
                title: {
                    text: 'Score of user'
                },
                plotLines: [{
                    value: 5,
                    color: 'blue',
                    width: 1,
                    label: {
                        //text: '理论模型: 932',
                        align: 'center',
                        style: {
                            color: 'gray'
                        }
                    }
                }],
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name}</b><br/>' + // eslint-disable-line no-dupe-keys
                'Max: {point.high}<br/>' +
                'Q2\t: {point.q3}<br/>' +
                'Median: {point.median}<br/>' +
                'Q1\t: {point.q1}<br/>' +
                'Min: {point.low}<br/>'
            },
            series: [{
                name: 'Score',
                //colorByPoint: true,
                data: data['score'],
                tooltip: {
                    headerFormat: '<em>Genre： {point.key}</em><br/>'
                }
            }],
            plotOptions: {
                boxplot: {
                    fillColor: '#F0F0E0',
                    lineWidth: 2,
                    medianColor: '#0C5DA5',
                    medianWidth: 2,
                    stemColor: '#A63400',
                    stemDashStyle: 'dot',
                    stemWidth: 2,
                    whiskerColor: '#0C5DA5',
                    whiskerLength: '30%',
                    whiskerWidth: 2
                }
            }
        }
        var myChart = Highcharts.chart(document.getElementById('boxplotScore'),options);
    }


    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url:"http://127.0.0.1:5000/overview",
            dataType : "json",
            success: function (data) {
                charts_overview(data)
            }
        });
        $.ajax({
            type: "GET",
            url:"http://127.0.0.1:5000/peiNumber",
            dataType : "json",
            success: function (data) {
                charts_peiNumbers(2016,data)
            }
        });
        $.ajax({
            type: "GET",
            url:"http://127.0.0.1:5000/peiSale",
            dataType : "json",
            success: function (data) {
                charts_peiSales(2016,data)
            }
        });
        $.ajax({
            type: "GET",
            url:"http://127.0.0.1:5000/wordcloud",
            dataType : "json",
            success: function (data) {
                charts_names(2016,data['text'])
            }
        });
        $.ajax({
            type: "GET",
            url:"http://127.0.0.1:5000/boxplotScore",
            dataType : "json",
            success: function (data) {
                charts_boxplotScore(2016,data)
            }
        });
    })
})



		
		
		


		









