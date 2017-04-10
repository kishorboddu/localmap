using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using localmap.data.Models;

namespace localmap.Controllers
{
    public class MapController : Controller
    {
        // GET: Map
        public ActionResult Index(string id)
        {
            return View(new LayerInfo() { Id = "some_id", Title = "Cherry Bangaru", url = "some Url" });
        }
    }
}