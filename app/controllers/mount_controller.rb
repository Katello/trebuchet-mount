class MountController < ApplicationController
  
  def index
    github       = Github.new
    operations   = github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs')

    operations = operations.body.select{ |op| op.name != '.gitkeep' }.map(&:name)
    
    render :locals => { :operations => operations }
  end

end
