class MountController < ApplicationController
  
  def index
    operations = Dir.entries(data_dir).select do |file|
      if file != '.' && file != '..' && file != '.gitkeep'
        true
      end
    end
    
    render :locals => { :operations => operations }
  end

end
