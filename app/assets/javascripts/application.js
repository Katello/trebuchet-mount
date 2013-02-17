// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.

//= require 'alchemy/jquery/jquery-1.6.2'
//= require 'alchemy/underscore-1.3.1'
//= require 'alchemy/jquery/plugins/jquery.tipsy'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.stack'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.selection'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.crosshair'


$(function(){
    var debriefs = [];


    function get_debriefs(debrief_name){
        $.ajax({
            url     : '/debrief/',
            method  : 'get', 
            dataType: 'json',
            data    : 'name=' + debrief_name
        }).done(function(data){
            setup_plot(data);
        });
    };

    function setup_plot(data){
        var ticks   = [0],
            cases   = [],
            points  = [],
            placeholder = $('.placeholder'),
            settings,
            latestPosition,
            updateLegendTimeout = null,
            plot,
            legends;

        debriefs = data;

        function convert_time(number){
            if( number / 3600 > 1 ){
                return (number / 3600).toFixed(1) + ' hr';
            } else if( number / 60 > 1){
                return (number / 60).toFixed(1) + ' min';
            } else {
                return number.toFixed(1) + ' sec';
            }
        }

        var stack = false,
            bars = true,
            lines = false,
            steps = false;

        settings = {
            grid : { 
                hoverable : true,
                autoHighlight : false
            },
            crosshair : {
                mode : "x"
            },
            series : { 
                stack : true,
                lines : {
                        show: lines,
                        fill: true,
                        steps: steps
                    },
                    bars: {
                        show: bars,
                        barWidth: 0.5,
                        horizontal: true
                    }
            },
            yaxis: {
                ticks : ticks,
                alignTicksWithAxis : true,
                position : 'left'
            }, 
            selection: {
                mode: "xy"
            },
            xaxis: {
                position : 'top',
                tickFormatter : convert_time
            }
        };

        _.each(debriefs, function(debrief, debrief_index, debrief_list){
            points  = [];

            _.each(debrief['data'], function(element, index, list){
                points.push([element['performance']['duration'], list.length - index+1]);
            });

            cases.push({ label : debrief['name'], data : points });
        });

        _.each(debriefs[0]['data'], function(element, index, list){
            ticks.push([list.length - index+1, element['id']]);
        });

        placeholder.bind("plotselected", function (event, ranges) {

            plot_with_options($.extend(true, {}, settings, {
                xaxis: {
                    min: ranges.xaxis.from,
                    max: ranges.xaxis.to
                },
                yaxis: {
                    min: ranges.yaxis.from,
                    max: ranges.yaxis.to
                }
            }));

        });

        function plot_with_options(options){
            plot = $.plot(placeholder, cases, options);
            legends = placeholder.find(".legendLabel");

            legends.each(function () {
                $(this).css('width', $(this).width());
            });
        }

        plot_with_options(settings);

        function updateLegend() {
            var pos = latestPosition,
                value = convert_time(pos.x),
                axes = plot.getAxes();


            updateLegendTimeout = null;

            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                $('#tooltip').addClass('hidden');
            } else {
                $('#tooltip').html(value).css({
                    top : pos.pageY - 15,
                    left : pos.pageX + 5
                }).removeClass('hidden');
            }
        }

        placeholder.bind("plothover", function (event, pos, item) {
            latestPosition = pos;
            if (!updateLegendTimeout) {
                updateLegendTimeout = setTimeout(updateLegend, 50);
            }
        });

        $('#reset_axis').live('click', function(){
            plot_with_options(settings);
            plot_with_options(settings);
        });
    }

    $('#operation_select').live('change', function(){
        get_debriefs($(this).val());
    });

});
