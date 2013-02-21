class DebriefController < ApplicationController
  
  def index
    name = params[:name]

    debriefs_list = Dir.entries(data_dir + '/' + name).select do |file| 
      if file != '.' && file != '..' && file != '.gitkeep'
        true
      end
    end

    render :json => debriefs_list
  end

  def pull_data
    operations = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs')
    operations = operations.body.select{ |op| op.name != '.gitkeep' }.map(&:name)

    operations.each do |op|
      FileUtils.mkdir_p(data_dir + op) unless File.exists?(data_dir + op)
    end

    operations.each do |op|
      sieges  = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + op)

      sieges.each do |siege|
        file  = @github.repos.contents.get('Katello', 'trebuchet', 'data/debriefs/' + op + '/' + siege.name)
        file  = Base64.decode64(file.content)

        if !File.exists?(data_dir + '/' + op + '/' + siege.name)
          File.open(data_dir + '/' + op + '/' + siege.name, 'w+'){ |f| f.write(file) }
        end
      end
    end
    
    render :text => operations
  end

end
