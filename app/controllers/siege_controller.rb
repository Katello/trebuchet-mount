class SiegeController < ApplicationController
  
  def index
    runner = ::Trebuchet::Runner.new
    
    operations = runner.list_operations
    
    render :locals => { :operations => operations }
  end

end
