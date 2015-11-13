class Groups::AvatarsController < ApplicationController
  def destroy
    @group.remove_avatar!
    @group.save

    redirect_to edit_group_path(@group)
  end
end
