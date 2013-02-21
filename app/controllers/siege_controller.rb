class SiegeController < ApplicationController
  
  def index
    operation = params[:operation]
    debriefs_list = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + operation)

    sieges = []
    debriefs_list.each do |debrief|
      siege  = github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + operation + '/' + debrief.name)
      siege  = Base64.decode64(siege.content)
      sieges << siege
    end
    
    render :json => sieges
  end

  def show
    name      = params[:name]
    operation = params[:operation]

    siege   = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + operation + '/' + name)
    siege   = Base64.decode64(siege.content)

    render :json => siege
  end

end
