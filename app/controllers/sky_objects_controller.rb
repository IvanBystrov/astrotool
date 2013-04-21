require 'net/http'

class SkyObjectsController < ApplicationController
  
  def search
    if params[:q]
      skyObject = SkyObject.where(:catalog_id => params[:q]).first
      
      if skyObject
        respond_to do |format|
          format.json { render json: skyObject.to_json }
        end
      else
        url = URI.parse("http://server1.sky-map.org")
      
        get_params = {
          :star => params[:q]
        }
      
        encoded_params = URI.encode_www_form(get_params)
        path = ["/search", encoded_params].join("?")


        # req = Net::HTTP::Get.new(url)
        res = Net::HTTP.start(url.host, url.port) {|http|
          puts "path: " + path
          http.get(path)
        }
        doc = Nokogiri::XML(res.body);

        star = doc.search('object').first
        
        puts star

        skyObject = nil

        if star
          skyObject = SkyObject.new

          # catalog id
          catId = star.search('catId').first
          skyObject.catalog_id = catId.content


          # Human names
          names = star.search('names').first
          skyObject.human_names = names.content unless names.nil?

          # ra, de, mag
          skyObject.ra = star.search('ra').first.content
          skyObject.de = star.search('de').first.content
          skyObject.mag = star.search('mag').first.content

          # constellation
          constellation = star.search("constellation").first
          skyObject.constellation_name = constellation.content unless constellation.nil?
          
          skyObject.save
        end
      
        puts skyObject.inspect

        respond_to do |format|
          format.json { render json: skyObject.to_json }
        end
      end
      
    else
      ra = params[:ra]
      de = params[:de]

      url = URI.parse("http://server2.sky-map.org")

      get_params = {
        :ra => ra,
        :de => de,
        :max_stars => 1,
        :angle => 30
      }


      encoded_params = URI.encode_www_form(get_params)
      path = ["/getstars.jsp", encoded_params].join("?")


      # req = Net::HTTP::Get.new(url)
      res = Net::HTTP.start(url.host, url.port) {|http|
        http.get(path)
      }
      doc = Nokogiri::XML(res.body);

      star = doc.search('star').first

      skyObject = nil

      if star
        skyObject = SkyObject.new

        # catalog id
        catId = star.search('catId').first
        skyObject.catalog_id = catId.content


        # Human names
        names = star.search('names').first
        skyObject.human_names = names.content unless names.nil?

        # ra, de, mag
        skyObject.ra = star.search('ra').first.content
        skyObject.de = star.search('de').first.content
        skyObject.mag = star.search('mag').first.content

        # constellation
        constellation = star.search("constellation").first
        skyObject.constellation_name = constellation_name.content unless constellation.nil?
        skyObject.save
      end

      respond_to do |format|
        format.json { render json: skyObject.to_json }
      end
    end
    
  end
      
end
