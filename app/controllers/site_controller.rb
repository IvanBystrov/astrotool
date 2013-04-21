class SiteController < ApplicationController
  
  def index
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @users }
    end
  end
  
end
