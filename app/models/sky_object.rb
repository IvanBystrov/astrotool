class SkyObject < ActiveRecord::Base
  attr_accessible :catalog_id, :constellation_name, :de, :human_names, :mag, :name, :ra
end
