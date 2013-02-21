class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :setup_github_config

  def setup_github_config
    @github = Github.new :client_id => 'e804c7e9936611b95685', :client_secret => '64a42266b3c602e183e7695e6973b97069938887'
    #@github.authorize_url :redirect_uri => 'https://trebuchet-katelloproject.rhcloud.com/', :scope => 'repo'
    #token = @github.get_token( authorization_code )
    #@github = Github.new :oauth_token => token
  end

end
