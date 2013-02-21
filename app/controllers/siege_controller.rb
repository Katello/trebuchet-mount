class SiegeController < ApplicationController
  
  def index
    operation = params[:operation]

    debriefs_list = Dir.entries(data_dir + '/' + operation).select do |file| 
      if file != '.' && file != '..' && file != '.gitkeep'
        true
      end
    end

    sieges = {}
    debriefs_list.each do |debrief|
      File.open(data_dir + '/' + operation + '/' + debrief, 'r') do |file|
        sieges[debrief] =  JSON.parse(file.read)
      end
    end
    
    render :json => sieges
  end

  def show
    name      = params[:name]
    operation = params[:operation]
    siege     = nil

    File.open(data_dir + '/' + operation + '/' + name, 'r') do |file|
      siege = JSON.parse(file.read)
    end

    render :json => siege
  end

end
