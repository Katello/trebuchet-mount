class SiegeController < ApplicationController
  
  def index
    runner = ::Trebuchet::Runner.new
    operations = runner.list_operations
    
    render :locals => { :operations => operations }
  end

  def show
    name      = params[:name]
    operation = params[:operation]

    github  = Github.new
    siege   = github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + operation + '/' + name)
    siege   = Base64.decode64(siege.content)

    render :json => siege
  end

end
