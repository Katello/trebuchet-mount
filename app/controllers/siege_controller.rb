require 'open3'

class SiegeController < ApplicationController
  
  def index
    runner = ::Trebuchet::Runner.new
    operations = runner.list_operations
    
    render :locals => { :operations => operations }
  end

  def pull_data
    dir = ENV['OPENSHIFT_DATA_DIR'].nil? ? './data/' : ENV['OPENSHIFT_DATA_DIR']
    dir += 'trebuchet/'
    stdin, stdout, stderr = ::Open3.popen3("cd #{dir} && git pull")

    response = stdout.gets.to_s

    if !stderr.gets.nil?
      response += ' \\n errors: '
      response += stderr.gets.to_s
    end

    render :text => response
  end

end
