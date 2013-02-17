class DebriefController < ApplicationController
  
  def index
    collection = ::Trebuchet::DebriefCollection.new
    name = params[:name]
   
    render :json => collection.get(name)
  end

end
