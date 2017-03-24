using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(localmap.Startup))]
namespace localmap
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
