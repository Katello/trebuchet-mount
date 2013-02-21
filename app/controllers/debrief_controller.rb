class DebriefController < ApplicationController
  
  def index
    name = params[:name]

    debriefs_list = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + name)

    render :json => debriefs_list
  end

end
