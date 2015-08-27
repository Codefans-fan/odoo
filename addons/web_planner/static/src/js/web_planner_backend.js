odoo.define('web.planner', function (require) {
"use strict";

var core = require('web.core');
var Model = require('web.Model');
var SystrayMenu = require('web.SystrayMenu');
var Widget = require('web.Widget');
var planner = require('web.planner.common');
var webclient = require('web.web_client');

var PlannerDialog = planner.PlannerDialog;

var PlannerLauncher = Widget.extend({
    template: "PlannerLauncher",
    init: function(parent) {
        this._super(parent);
        this.planner_by_menu = {};
        this.need_reflow = false;
    },
    start: function() {
        var self = this;
        core.bus.on("change_menu_section", self, self.on_menu_clicked);
        var res =  self._super.apply(this, arguments).then(function() {
            self.$el.filter('.o_planner_systray').on('click', self, self.toggle_dialog.bind(self));
            return self.fetch_application_planner();
        }).then(function(apps) {
            self.do_hide();  // hidden by default
            self.planner_apps = apps;
            return apps;
        });
        return res;
    },
    fetch_application_planner: function() {
        var self = this;
        var def = $.Deferred();
        if (!_.isEmpty(this.planner_by_menu)) {
            def.resolve(self.planner_by_menu);
        }else{
            (new Model('web.planner')).query().all().then(function(res) {
                _.each(res, function(planner){
                    self.planner_by_menu[planner.menu_id[0]] = planner;
                    self.planner_by_menu[planner.menu_id[0]].data = $.parseJSON(self.planner_by_menu[planner.menu_id[0]].data) || {};
                });
                def.resolve(self.planner_by_menu);
            }).fail(function() {def.reject();});
        }
        return def;
    },
    on_menu_clicked: function(menu_id) {
        if (_.contains(_.keys(this.planner_apps), menu_id.toString())) {
            this.setup(this.planner_apps[menu_id]);
            this.need_reflow = true;
        } else {
            this.do_hide();
            this.need_reflow = true;
        }
        if (this.need_reflow) {
            core.bus.trigger('resize');
            this.need_reflow = false;
        }

        if (this.dialog) {
            this.dialog.$el.modal('hide');
        }
    },
    setup: function(planner){
        var self = this;

        this.planner = planner;
        if (this.dialog) {
            this.dialog.$el.modal('hide');
            this.dialog.destroy();
        }
        this.dialog = new PlannerDialog(this, planner);
        this.dialog.$el.remove();
        this.dialog.appendTo(webclient.$el);
        this.$(".o_planner_progress").tooltip({html: true, title: this.planner.tooltip_planner, placement: 'bottom', delay: {'show': 500}});
        this.dialog.on("planner_progress_changed", this, function(percent){
            self.update_parent_progress_bar(percent);
        });
    },
    update_parent_progress_bar: function(percent) {
        if (percent == 100) {
            this.$(".progress").hide();
        } else {
            this.$(".progress").show();
        }
        this.do_show();
        this.$(".progress-bar").css('width', percent+"%");
    },
    toggle_dialog: function() {
        this.dialog.$el.modal('toggle');
    }
});

SystrayMenu.Items.push(PlannerLauncher);

return {
    PlannerLauncher: PlannerLauncher,
};

});

