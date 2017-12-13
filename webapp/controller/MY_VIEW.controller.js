sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../TABLE/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/table/SelectionMode",
	"sap/ui/table/SelectionBehavior",
	"sap/ui/core/BusyIndicator"
], function(Controller, TableExampleUtils, MessageToast, MessageBox, JSONModel, ODataModel, ResourceModel, SelectionMode,
	SelectionBehavior, BusyIndicator) {
	"use strict";
	return Controller.extend("z_label_prt2.controller.MY_VIEW", {
		onInit: function() {
			var i18nModel = new ResourceModel({
				bundleName: "z_label_prt2.i18n.i18n" //,
			});
			this.getView().setModel(i18nModel, "i18n");
			var oView = this.getView();
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				oView.byId("Article").setVisible(true);
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			this.GetData("D");
		},

		ClearLabels: function(oEvent) {
			var URL = "/sap/opu/odata/sap/ZONLINE_SCAN_SRV/";
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var Button = oView.byId("TOOL_BAR");
			var model = new JSONModel();
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(ZembArt='T')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				oTable.setVisible(false);
				Button.setVisible(false);
				oView.setModel(model, "itemModel");
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("list_cleared");
				MessageToast.show(infoMsg, {
					my: "center top",
					at: "center top"
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
		},

		searchArt: function(oEvent) {
			var oView = this.getView();
			var oController = this;
			var oTable = oView.byId("table1");
			var material = oView.byId("SearchArt").getValue();
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/MessageSet(PValue='0202" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("z_label_prt2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					var infoMsg = oView.getModel("i18n").getResourceBundle().getText("scan_a_valid_material");
					MessageBox.show(infoMsg, MessageBox.Icon.ERROR);
				} else {
					oTable.setVisible(true);
					oController.GetData("A");
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
		},

		SaveSelected: function(oEvent) {
			var oController = this;
			var oView = oController.getView();
			var oTable = oView.byId("table1");
			var Button = oView.byId("TOOL_BAR");
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
			var URL = "/sap/opu/odata/sap/ZONLINE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(ZembArt='S')";
			var model = new JSONModel();
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				oTable.setVisible(false);
				Button.setVisible(false);
				oView.setModel(model, "itemModel");
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("list_saved");
				MessageToast.show(infoMsg, {
					my: "center top",
					at: "center top"
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		GetData: function(action) {
			var oView = this.getView();
			var oTable = this.getView().byId("table1");
			var material = this.getView().byId("SearchArt").getValue();
			var searchString = action + "/" + material;
			oView.byId("SearchArt").setValue("");
			var URL = "/sap/opu/odata/sap/ZONLINE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var lines = newArray.length;
				var sum = 0;
				if (lines > 0) {
					for (var i = 0; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Menge, false) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					var oArticle = oView.byId("TOOL_BAR");
					oArticle.setVisible(true);
					oTable.setVisible(true);
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					oView.setModel(model, "itemModel");
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v) {
				if (k !== SelectionMode.Multi) {
					aSelectionModes.push({
						key: k,
						text: v
					});
				}
			});
			var aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v) {
				aSelectionBehaviors.push({
					key: k,
					text: v
				});
			});
			// create JSON model instance
			var oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});
			oView.setModel(oModel, "selectionmodel");
		}
	});
});