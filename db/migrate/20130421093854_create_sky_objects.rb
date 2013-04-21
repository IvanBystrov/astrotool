class CreateSkyObjects < ActiveRecord::Migration
  def change
    create_table :sky_objects do |t|
      t.string :name
      t.string :ra
      t.string :de
      t.string :mag
      t.string :constellation_name
      t.string :catalog_id
      t.string :human_names

      t.timestamps
    end
  end
end
