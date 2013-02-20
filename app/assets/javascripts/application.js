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
//= require 'alchemy/jquery/plugins/jquery.ba-bbq'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.stack'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.selection'
//= require 'alchemy/jquery/plugins/flot-0.7/jquery.flot.crosshair'
//= require 'jquery.flot.hiddengraphs'
//= require 'base64'
//= require 'github'


$(function(){
    var siege_select = function(sieges){
            var $select = $('#siege_select'),
                html = '<option value=""></option>';

            $select.empty();
            
            _.each(sieges, function(element, index, list){
                html += '<option value="'+ element['name'] +'">' + element['name'] + '</option>'
            });
            
            $select.html(html);
            $select.removeAttr('disabled');
            $select.parents('.control_group').removeClass('disabled');
            //setup_plot();
        },
        get_debrief = function(name, operation){
            $.ajax({
                url     : '/siege/' + operation,
                method  : 'get', 
                dataType: 'json',
                data    : 'name=' + name + '&operation=' + operation
            }).done(function(data){
                setup_plot(data);
            });
        };

    function get_sieges(debrief_name){
        $.ajax({
            url     : '/debrief/',
            method  : 'get', 
            dataType: 'json',
            data    : 'name=' + debrief_name
        }).done(function(data){
            siege_select(data);
        });
    };

    function setup_plot(debrief){
        var placeholder = $('.placeholder'),
            settings,
            latestPosition,
            updateLegendTimeout = null,
            plot,
            legends,
            bars = true,
            lines = false,
            steps = false,
            disabled_list = {},

            set_ticks = function(debrief){
                var ticks = [];

                _.each(debrief['data'], function(element, index, list){
                    ticks.push([list.length - index+1, element['id']]);
                });

                return ticks;
            },
            convert_time = function(number, precision){
                precision = (precision === undefined) ? precision : 1;

                if( number / 3600 > 1 ){
                    return (number / 3600).toFixed(precision) + ' hr';
                } else if( number / 60 > 1){
                    return (number / 60).toFixed(precision) + ' min';
                } else {
                    return number.toFixed(precision) + ' sec';
                }
            },
            generate_data = function(debrief){
                var cases = [], points = [];

                _.each(debrief['data'], function(element, index, list){
                    points.push([element['performance']['duration'], list.length - index+1]);
                });

                cases.push({ label : debrief['name'], data : points });

                return cases;
            };

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
                bars: {
                    show: bars,
                    barWidth: 0.5,
                    horizontal: true,
                    align: 'right'
                }
            },
            yaxis: {
                ticks : set_ticks(debrief),
                alignTicksWithAxis : true,
                position : 'left'
            }, 
            selection: {
                mode: "xy"
            },
            xaxis: {
                position : 'top',
                tickFormatter : convert_time
            },
            legend : {
                hideable : true
            }
        };

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
            }), generate_data(debrief));

        });

        function plot_with_options(options, data){
            plot = $.plot(placeholder, data, options);
            legends = placeholder.find(".legendLabel");

            legends.each(function () {
                $(this).css('width', $(this).width());
            });
        }

        plot_with_options(settings, generate_data(debrief));

        function updateLegend() {
            var pos = latestPosition,
                value = convert_time(pos.x, 2),
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
            plot_with_options(settings, generate_data(debrief));
            plot_with_options(settings, generate_data(debrief));
        });

    }

    $('#siege_select').live('change', function(){
        var name      = $(this).val(),
            operation = $('#operation_select').val();

        get_debrief(name, operation);
    });

    $('#operation_select').live('change', function(){
        $.bbq.pushState({ siege : $(this).val() });
        get_sieges($(this).val());
    });

    var init_state = $.bbq.getState('siege');

    if( init_state !== undefined ){
        get_sieges(init_state);
        $('#operation_select').val(init_state);
    }

});
